import Product from "../models/Product.js";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

const searchByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a jewellery image.",
      });
    }

    const requestedLimit = Number(req.query.limit) || 4;

    const limit = Math.min(
      Math.max(requestedLimit, 1),
      10
    );

    /*
      Use Node's native FormData and Blob.

      Do not manually set Content-Type.
      fetch will automatically add the correct multipart boundary.
    */

    const formData = new FormData();

    const imageBlob = new Blob(
      [req.file.buffer],
      {
        type: req.file.mimetype || "image/jpeg",
      }
    );

    formData.append(
      "image",
      imageBlob,
      req.file.originalname || "uploaded-image.jpg"
    );

    const aiResponse = await fetch(
      `${AI_SERVICE_URL}/search?limit=${limit}`,
      {
        method: "POST",
        body: formData,
      }
    );

    let aiData;

    try {
      aiData = await aiResponse.json();
    } catch {
      const responseText = await aiResponse.text();

      throw new Error(
        responseText ||
          "The AI service returned an invalid response."
      );
    }

    if (!aiResponse.ok || !aiData.success) {
      return res.status(aiResponse.status || 500).json({
        success: false,
        message:
          aiData.detail ||
          aiData.message ||
          "AI image search failed.",
      });
    }

    const aiResults = Array.isArray(aiData.results)
      ? aiData.results
      : [];

    const productIds = aiResults
      .map((result) => result.productId)
      .filter(Boolean);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).lean();

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    const enrichedResults = aiResults
      .map((result) => {
        const product = productMap.get(
          String(result.productId)
        );

        if (!product) {
          return null;
        }

        return {
          ...product,

          similarityScore:
            result.similarityScore,

          matchedReferenceImage:
            result.matchedReferenceImage,

          matchedReferenceCount:
            result.matchedReferenceCount,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: enrichedResults.length,
      model: aiData.model,
      indexedReferenceImages:
        aiData.indexedReferenceImages,
      indexedProducts:
        aiData.indexedProducts,
      results: enrichedResults,
    });
  } catch (error) {
    console.error(
      "Image search controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete the AI image search.",
      error: error.message,
    });
  }
};

export { searchByImage };