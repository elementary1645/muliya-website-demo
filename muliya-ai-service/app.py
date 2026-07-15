from __future__ import annotations

import io
import json
import os
from pathlib import Path
from typing import Any

import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
from transformers import CLIPModel, CLIPProcessor


# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

EMBEDDINGS_DIR = BASE_DIR / "embeddings"
EMBEDDINGS_FILE = EMBEDDINGS_DIR / "product_embeddings.npy"
METADATA_FILE = EMBEDDINGS_DIR / "product_metadata.json"

MODEL_NAME = os.getenv(
    "CLIP_MODEL_NAME",
    "openai/clip-vit-base-patch32",
)

MAX_FILE_SIZE = 10 * 1024 * 1024
DEFAULT_RESULT_LIMIT = 4
MAX_RESULT_LIMIT = 10

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Muliya AI Jewellery Search",
    description=(
        "Local reference-image similarity search "
        "for jewellery products."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# GLOBAL STATE
# =========================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

clip_model: CLIPModel | None = None
clip_processor: CLIPProcessor | None = None

product_embeddings: np.ndarray | None = None
product_metadata: list[dict[str, Any]] = []


# =========================================================
# RESPONSE MODELS
# =========================================================

class SimilarProduct(BaseModel):
    productId: str
    code: str
    name: str
    category: str
    type: str
    collection: str
    price: str
    weight: str
    purity: str
    availability: str
    image: str
    branchAvailability: dict[str, bool]
    similarityScore: float
    matchedReferenceImage: str
    matchedReferenceCount: int


class SearchResponse(BaseModel):
    success: bool
    count: int
    model: str
    indexedReferenceImages: int
    indexedProducts: int
    results: list[SimilarProduct]


# =========================================================
# MODEL LOADING
# =========================================================

def load_clip_model() -> None:
    global clip_model
    global clip_processor

    if clip_model is not None and clip_processor is not None:
        return

    print(f"Loading CLIP model: {MODEL_NAME}")
    print(f"Using device: {device}")

    clip_processor = CLIPProcessor.from_pretrained(
        MODEL_NAME
    )

    clip_model = CLIPModel.from_pretrained(
        MODEL_NAME
    ).to(device)

    clip_model.eval()

    print("CLIP model loaded successfully.")


def load_product_embeddings() -> None:
    global product_embeddings
    global product_metadata

    if (
        not EMBEDDINGS_FILE.exists()
        or not METADATA_FILE.exists()
    ):
        print(
            "Embedding files were not found. "
            "Run generate_embeddings.py."
        )

        product_embeddings = None
        product_metadata = []
        return

    try:
        loaded_embeddings = np.load(
            EMBEDDINGS_FILE
        ).astype(np.float32)

        with open(
            METADATA_FILE,
            "r",
            encoding="utf-8",
        ) as metadata_file:
            loaded_metadata = json.load(
                metadata_file
            )

        if loaded_embeddings.ndim != 2:
            raise ValueError(
                "Embeddings must be a 2D array."
            )

        if not isinstance(loaded_metadata, list):
            raise ValueError(
                "Metadata must be a list."
            )

        if (
            loaded_embeddings.shape[0]
            != len(loaded_metadata)
        ):
            raise ValueError(
                "Embedding and metadata counts differ."
            )

        product_embeddings = loaded_embeddings
        product_metadata = loaded_metadata

        print(
            f"Loaded {len(product_metadata)} "
            "reference-image embeddings."
        )

    except Exception as error:
        print(
            f"Unable to load embeddings: {error}"
        )

        product_embeddings = None
        product_metadata = []


@app.on_event("startup")
def startup_event() -> None:
    EMBEDDINGS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    load_clip_model()
    load_product_embeddings()


# =========================================================
# IMAGE PROCESSING
# =========================================================

def validate_image_file(
    uploaded_file: UploadFile,
    image_bytes: bytes,
) -> None:
    if uploaded_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format. "
                "Upload JPEG, PNG, or WebP."
            ),
        )

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=(
                "The image is too large. "
                "Maximum file size is 10 MB."
            ),
        )


def open_image(
    image_bytes: bytes,
) -> Image.Image:
    try:
        image = Image.open(
            io.BytesIO(image_bytes)
        )

        image.verify()

        return Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail="Unable to process the uploaded image.",
        ) from error


def generate_image_embedding(
    image: Image.Image,
) -> np.ndarray:
    if clip_model is None or clip_processor is None:
        raise HTTPException(
            status_code=503,
            detail="The image model is unavailable.",
        )

    try:
        inputs = clip_processor(
            images=image,
            return_tensors="pt",
        )

        pixel_values = inputs["pixel_values"].to(
            device
        )

        with torch.inference_mode():
            vision_output = clip_model.vision_model(
                pixel_values=pixel_values
            )

            pooled_output = (
                vision_output.pooler_output
            )

            image_features = (
                clip_model.visual_projection(
                    pooled_output
                )
            )

        image_features = (
            torch.nn.functional.normalize(
                image_features,
                p=2,
                dim=-1,
            )
        )

        return (
            image_features
            .cpu()
            .numpy()
            .astype(np.float32)
        )

    except Exception as error:
        print(
            f"Image embedding error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate an embedding "
                "for the uploaded image."
            ),
        ) from error


# =========================================================
# RESULT GROUPING
# =========================================================

def get_indexed_product_count() -> int:
    return len(
        {
            str(item.get("productId", ""))
            for item in product_metadata
            if item.get("productId")
        }
    )


def group_results_by_product(
    similarity_scores: np.ndarray,
) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, Any]] = {}

    for index, score_value in enumerate(
        similarity_scores
    ):
        metadata = product_metadata[index]

        product_id = str(
            metadata.get("productId", "")
        )

        if not product_id:
            continue

        score = float(score_value)

        if product_id not in grouped:
            grouped[product_id] = {
                "metadata": metadata,
                "bestScore": score,
                "bestReferenceImage":
                    metadata.get(
                        "referenceImage",
                        "",
                    ),
                "referenceCount": 1,
            }

            continue

        grouped_product = grouped[
            product_id
        ]

        grouped_product[
            "referenceCount"
        ] += 1

        if score > grouped_product[
            "bestScore"
        ]:
            grouped_product[
                "bestScore"
            ] = score

            grouped_product[
                "bestReferenceImage"
            ] = metadata.get(
                "referenceImage",
                "",
            )

            grouped_product[
                "metadata"
            ] = metadata

    return sorted(
        grouped.values(),
        key=lambda item: item["bestScore"],
        reverse=True,
    )


# =========================================================
# ROUTES
# =========================================================

@app.get("/")
def root() -> dict[str, Any]:
    return {
        "success": True,
        "message":
            "Muliya AI Jewellery Search service is running.",
        "model": MODEL_NAME,
        "device": str(device),
        "embeddingsLoaded":
            product_embeddings is not None,
        "indexedReferenceImages":
            len(product_metadata),
        "indexedProducts":
            get_indexed_product_count(),
    }


@app.get("/health")
def health_check() -> dict[str, Any]:
    return {
        "success": True,
        "status": "healthy",
        "modelLoaded":
            clip_model is not None,
        "processorLoaded":
            clip_processor is not None,
        "embeddingsLoaded":
            product_embeddings is not None,
        "indexedReferenceImages":
            len(product_metadata),
        "indexedProducts":
            get_indexed_product_count(),
        "device": str(device),
    }


@app.post(
    "/search",
    response_model=SearchResponse,
)
async def search_similar_jewellery(
    image: UploadFile = File(...),
    limit: int = DEFAULT_RESULT_LIMIT,
) -> SearchResponse:
    if limit < 1:
        limit = 1

    if limit > MAX_RESULT_LIMIT:
        limit = MAX_RESULT_LIMIT

    if (
        product_embeddings is None
        or not product_metadata
    ):
        raise HTTPException(
            status_code=503,
            detail=(
                "Reference-image embeddings are unavailable. "
                "Run generate_embeddings.py first."
            ),
        )

    image_bytes = await image.read()

    validate_image_file(
        image,
        image_bytes,
    )

    uploaded_image = open_image(
        image_bytes
    )

    query_embedding = generate_image_embedding(
        uploaded_image
    )

    similarity_scores = cosine_similarity(
        query_embedding,
        product_embeddings,
    )[0]

    grouped_results = group_results_by_product(
        similarity_scores
    )

    selected_results = grouped_results[:limit]

    results: list[SimilarProduct] = []

    for grouped_result in selected_results:
        metadata = grouped_result[
            "metadata"
        ]

        results.append(
            SimilarProduct(
                productId=str(
                    metadata.get(
                        "productId",
                        "",
                    )
                ),

                code=str(
                    metadata.get(
                        "code",
                        "",
                    )
                ),

                name=str(
                    metadata.get(
                        "name",
                        "Unknown Product",
                    )
                ),

                category=str(
                    metadata.get(
                        "category",
                        "",
                    )
                ),

                type=str(
                    metadata.get(
                        "type",
                        "",
                    )
                ),

                collection=str(
                    metadata.get(
                        "collection",
                        "",
                    )
                ),

                price=str(
                    metadata.get(
                        "price",
                        "",
                    )
                ),

                weight=str(
                    metadata.get(
                        "weight",
                        "",
                    )
                ),

                purity=str(
                    metadata.get(
                        "purity",
                        "",
                    )
                ),

                availability=str(
                    metadata.get(
                        "availability",
                        "",
                    )
                ),

                image=str(
                    metadata.get(
                        "image",
                        "",
                    )
                ),

                branchAvailability=dict(
                    metadata.get(
                        "branchAvailability",
                        {},
                    )
                ),

                similarityScore=round(
                    grouped_result[
                        "bestScore"
                    ] * 100,
                    2,
                ),

                matchedReferenceImage=str(
                    grouped_result[
                        "bestReferenceImage"
                    ]
                ),

                matchedReferenceCount=int(
                    grouped_result[
                        "referenceCount"
                    ]
                ),
            )
        )

    return SearchResponse(
        success=True,
        count=len(results),
        model=MODEL_NAME,
        indexedReferenceImages=
            len(product_metadata),
        indexedProducts=
            get_indexed_product_count(),
        results=results,
    )


@app.post("/reload-embeddings")
def reload_embeddings() -> dict[str, Any]:
    load_product_embeddings()

    return {
        "success": True,
        "message":
            "Reference-image embeddings reloaded.",
        "embeddingsLoaded":
            product_embeddings is not None,
        "indexedReferenceImages":
            len(product_metadata),
        "indexedProducts":
            get_indexed_product_count(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )