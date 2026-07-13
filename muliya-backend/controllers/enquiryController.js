import Enquiry from "../models/Enquiry.js";
import Product from "../models/Product.js";

const createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      preferredBranch,
      productId,
    } = req.body;

    if (!name || !email || !phone || !productId) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone number, and product ID are required.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      message: message || "",
      preferredBranch: preferredBranch || "Bengaluru",
      product: product._id,
      productCode: product.code,
      productName: product.name,
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("Create enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit enquiry.",
      error: error.message,
    });
  }
};

const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({})
      .populate(
        "product",
        "name code category type collection price image"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("Get enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve enquiries.",
      error: error.message,
    });
  }
};

const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate(
      "product",
      "name code category type collection price image"
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid enquiry ID.",
      error: error.message,
    });
  }
};

export {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
};