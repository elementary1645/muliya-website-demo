from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import numpy as np
import requests
import torch
from PIL import Image, UnidentifiedImageError
from transformers import CLIPModel, CLIPProcessor


# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

PRODUCT_IMAGES_DIR = BASE_DIR / "product_images"
EMBEDDINGS_DIR = BASE_DIR / "embeddings"

EMBEDDINGS_FILE = EMBEDDINGS_DIR / "product_embeddings.npy"
METADATA_FILE = EMBEDDINGS_DIR / "product_metadata.json"

BACKEND_PRODUCTS_URL = "http://localhost:5000/api/products"

MODEL_NAME = "openai/clip-vit-base-patch32"
REQUEST_TIMEOUT = 20

SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


# =========================================================
# DEVICE
# =========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# =========================================================
# LOAD CLIP
# =========================================================

def load_clip_model() -> tuple[CLIPModel, CLIPProcessor]:
    print(f"Loading CLIP model: {MODEL_NAME}")
    print(f"Using device: {DEVICE}")

    processor = CLIPProcessor.from_pretrained(MODEL_NAME)

    model = CLIPModel.from_pretrained(
        MODEL_NAME
    ).to(DEVICE)

    model.eval()

    print("CLIP model loaded successfully.")

    return model, processor


# =========================================================
# FETCH PRODUCTS FROM NODE BACKEND
# =========================================================

def fetch_products() -> list[dict[str, Any]]:
    print(f"Fetching products from: {BACKEND_PRODUCTS_URL}")

    response = requests.get(
        BACKEND_PRODUCTS_URL,
        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    data = response.json()

    if not data.get("success"):
        raise RuntimeError(
            "Backend returned an unsuccessful response."
        )

    products = data.get("products", [])

    if not isinstance(products, list):
        raise RuntimeError(
            "Products response is not a list."
        )

    print(f"Received {len(products)} products.")

    return products


def build_product_lookup(
    products: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    lookup: dict[str, dict[str, Any]] = {}

    for product in products:
        code = str(
            product.get("code", "")
        ).strip().upper()

        if code:
            lookup[code] = product

    return lookup


# =========================================================
# LOCAL IMAGE DISCOVERY
# =========================================================

def get_product_folders() -> list[Path]:
    if not PRODUCT_IMAGES_DIR.exists():
        raise RuntimeError(
            f"Product image folder does not exist: "
            f"{PRODUCT_IMAGES_DIR}"
        )

    return sorted(
        [
            folder
            for folder in PRODUCT_IMAGES_DIR.iterdir()
            if folder.is_dir()
        ]
    )


def get_images_from_folder(folder: Path) -> list[Path]:
    return sorted(
        [
            image_path
            for image_path in folder.iterdir()
            if image_path.is_file()
            and image_path.suffix.lower()
            in SUPPORTED_IMAGE_EXTENSIONS
        ]
    )


# =========================================================
# IMAGE PROCESSING
# =========================================================

def load_local_image(image_path: Path) -> Image.Image:
    image = Image.open(image_path)

    image.verify()

    return Image.open(image_path).convert("RGB")


def generate_embedding(
    image: Image.Image,
    model: CLIPModel,
    processor: CLIPProcessor,
) -> np.ndarray:
    inputs = processor(
        images=image,
        return_tensors="pt",
    )

    pixel_values = inputs["pixel_values"].to(DEVICE)

    with torch.inference_mode():
        vision_output = model.vision_model(
            pixel_values=pixel_values
        )

        pooled_output = vision_output.pooler_output

        image_features = model.visual_projection(
            pooled_output
        )

    image_features = torch.nn.functional.normalize(
        image_features,
        p=2,
        dim=-1,
    )

    return (
        image_features
        .cpu()
        .numpy()
        .astype(np.float32)[0]
    )


# =========================================================
# METADATA
# =========================================================

def build_metadata(
    product: dict[str, Any],
    image_path: Path,
) -> dict[str, Any]:
    return {
        "productId": str(
            product.get("_id", "")
        ),

        "code": product.get(
            "code",
            "",
        ),

        "name": product.get(
            "name",
            "",
        ),

        "category": product.get(
            "category",
            "",
        ),

        "type": product.get(
            "type",
            "",
        ),

        "collection": product.get(
            "collection",
            "",
        ),

        "price": product.get(
            "price",
            "",
        ),

        "weight": product.get(
            "weight",
            "",
        ),

        "purity": product.get(
            "purity",
            "",
        ),

        "availability": product.get(
            "availability",
            "",
        ),

        "image": product.get(
            "image",
            "",
        ),

        "branchAvailability": product.get(
            "branchAvailability",
            {},
        ),

        "referenceImage": str(
            image_path.relative_to(BASE_DIR)
        ),
    }


# =========================================================
# MAIN
# =========================================================

def main() -> None:
    EMBEDDINGS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    try:
        products = fetch_products()
        product_lookup = build_product_lookup(products)
        product_folders = get_product_folders()
    except Exception as error:
        print(f"Setup failed: {error}")
        sys.exit(1)

    if not product_folders:
        print("No product folders were found.")
        sys.exit(1)

    model, processor = load_clip_model()

    embeddings: list[np.ndarray] = []
    metadata: list[dict[str, Any]] = []

    failed_images: list[dict[str, str]] = []
    skipped_folders: list[dict[str, str]] = []

    total_images = 0

    for folder in product_folders:
        total_images += len(
            get_images_from_folder(folder)
        )

    print()
    print(
        f"Found {len(product_folders)} product folders."
    )
    print(
        f"Found {total_images} local reference images."
    )
    print()
    print("Generating reference-image embeddings...")
    print()

    processed_image_count = 0

    for folder in product_folders:
        product_code = folder.name.strip().upper()

        product = product_lookup.get(product_code)

        if not product:
            print(
                f"[SKIP] {product_code}: "
                "Product code not found in MongoDB."
            )

            skipped_folders.append(
                {
                    "code": product_code,
                    "reason":
                        "Product code not found in MongoDB",
                }
            )

            continue

        image_paths = get_images_from_folder(folder)

        if not image_paths:
            print(
                f"[SKIP] {product_code}: "
                "No supported images found."
            )

            skipped_folders.append(
                {
                    "code": product_code,
                    "reason":
                        "No supported images found",
                }
            )

            continue

        print()
        print(
            f"{product_code} - "
            f"{product.get('name', 'Unknown Product')}"
        )
        print(
            f"Reference images: {len(image_paths)}"
        )

        for image_path in image_paths:
            processed_image_count += 1

            print(
                f"  [{processed_image_count}/{total_images}] "
                f"{image_path.name}"
            )

            try:
                image = load_local_image(
                    image_path
                )

                embedding = generate_embedding(
                    image,
                    model,
                    processor,
                )

                embeddings.append(embedding)

                metadata.append(
                    build_metadata(
                        product,
                        image_path,
                    )
                )

                print("    Embedding generated.")

            except (
                UnidentifiedImageError,
                OSError,
                ValueError,
            ) as error:
                print(
                    f"    Failed: {error}"
                )

                failed_images.append(
                    {
                        "code": product_code,
                        "image": str(image_path),
                        "reason": str(error),
                    }
                )

            except Exception as error:
                print(
                    f"    Unexpected failure: {error}"
                )

                failed_images.append(
                    {
                        "code": product_code,
                        "image": str(image_path),
                        "reason": str(error),
                    }
                )

    if not embeddings:
        print()
        print("No embeddings were generated.")
        sys.exit(1)

    embedding_matrix = np.vstack(
        embeddings
    ).astype(np.float32)

    np.save(
        EMBEDDINGS_FILE,
        embedding_matrix,
    )

    with open(
        METADATA_FILE,
        "w",
        encoding="utf-8",
    ) as metadata_file:
        json.dump(
            metadata,
            metadata_file,
            indent=2,
            ensure_ascii=False,
        )

    unique_product_codes = sorted(
        {
            item["code"]
            for item in metadata
            if item.get("code")
        }
    )

    print()
    print("=" * 60)
    print("LOCAL EMBEDDING GENERATION COMPLETE")
    print("=" * 60)

    print(
        f"Indexed products: "
        f"{len(unique_product_codes)}"
    )

    print(
        f"Successful reference images: "
        f"{len(embeddings)}"
    )

    print(
        f"Failed images: "
        f"{len(failed_images)}"
    )

    print(
        f"Skipped folders: "
        f"{len(skipped_folders)}"
    )

    print(
        f"Embedding dimensions: "
        f"{embedding_matrix.shape[1]}"
    )

    print()
    print("Indexed product codes:")

    for code in unique_product_codes:
        reference_count = sum(
            1
            for item in metadata
            if item.get("code") == code
        )

        print(
            f"- {code}: "
            f"{reference_count} reference images"
        )

    print()
    print("Embeddings saved to:")
    print(EMBEDDINGS_FILE)

    print()
    print("Metadata saved to:")
    print(METADATA_FILE)

    if skipped_folders:
        print()
        print("SKIPPED FOLDERS")

        for skipped in skipped_folders:
            print(
                f"- {skipped['code']}: "
                f"{skipped['reason']}"
            )

    if failed_images:
        print()
        print("FAILED IMAGES")

        for failed in failed_images:
            print(
                f"- {failed['code']} / "
                f"{failed['image']}: "
                f"{failed['reason']}"
            )


if __name__ == "__main__":
    main()