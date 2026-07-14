import ExpertRequest from "../models/ExpertRequest.js";
import Product from "../models/Product.js";

const createExpertRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      preferredBranch,
      question,
      conversationContext,
      productId,
      source,
      priority,
    } = req.body;

    if (!name || !phone || !question) {
      return res.status(400).json({
        success: false,
        message:
          "Name, phone number, and customer question are required.",
      });
    }

    let product = null;

    if (productId) {
      product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Related product not found.",
        });
      }
    }

    const normalizedConversationContext = Array.isArray(
      conversationContext
    )
      ? conversationContext
          .filter(
            (item) =>
              item &&
              ["customer", "bot"].includes(item.sender) &&
              typeof item.text === "string" &&
              item.text.trim()
          )
          .slice(-10)
          .map((item) => ({
            sender: item.sender,
            text: item.text.trim(),
          }))
      : [];

    const expertRequest = await ExpertRequest.create({
      name: name.trim(),
      email: email?.trim() || "",
      phone: phone.trim(),
      preferredBranch: preferredBranch || "",
      question: question.trim(),
      conversationContext: normalizedConversationContext,
      product: product?._id || null,
      productCode: product?.code || "",
      productName: product?.name || "",
      source: source || "Chatbot",
      priority: priority || "Normal",
    });

    return res.status(201).json({
      success: true,
      message:
        "Your request has been sent to a jewellery expert.",
      expertRequest,
    });
  } catch (error) {
    console.error("Create expert request error:", error);

    if (error.name === "ValidationError") {
      const validationMessage = Object.values(error.errors)
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid related product ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to connect you with a jewellery expert.",
      error: error.message,
    });
  }
};

const getExpertRequests = async (req, res) => {
  try {
    const {
      status,
      priority,
      preferredBranch,
    } = req.query;

    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (priority) {
      filters.priority = priority;
    }

    if (preferredBranch) {
      filters.preferredBranch = preferredBranch;
    }

    const expertRequests = await ExpertRequest.find(filters)
      .populate(
        "product",
        "name code category type collection price image"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: expertRequests.length,
      expertRequests,
    });
  } catch (error) {
    console.error("Get expert requests error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve expert requests.",
      error: error.message,
    });
  }
};

const getExpertRequestById = async (req, res) => {
  try {
    const expertRequest = await ExpertRequest.findById(
      req.params.id
    ).populate(
      "product",
      "name code category type collection price image"
    );

    if (!expertRequest) {
      return res.status(404).json({
        success: false,
        message: "Expert request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      expertRequest,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid expert request ID.",
      error: error.message,
    });
  }
};

const updateExpertRequestStatus = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      internalNotes,
    } = req.body;

    const allowedStatuses = [
      "New",
      "Contacted",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    const allowedPriorities = [
      "Low",
      "Normal",
      "High",
    ];

    const updateData = {};

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid expert request status.",
        });
      }

      updateData.status = status;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid expert request priority.",
        });
      }

      updateData.priority = priority;
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo =
        String(assignedTo).trim();
    }

    if (internalNotes !== undefined) {
      updateData.internalNotes =
        String(internalNotes).trim();
    }

    const expertRequest =
      await ExpertRequest.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "product",
        "name code category type collection price image"
      );

    if (!expertRequest) {
      return res.status(404).json({
        success: false,
        message: "Expert request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Expert request updated successfully.",
      expertRequest,
    });
  } catch (error) {
    console.error(
      "Update expert request error:",
      error
    );

    if (error.name === "ValidationError") {
      const validationMessage = Object.values(error.errors)
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        "Unable to update expert request.",
      error: error.message,
    });
  }
};

export {
  createExpertRequest,
  getExpertRequests,
  getExpertRequestById,
  updateExpertRequestStatus,
};