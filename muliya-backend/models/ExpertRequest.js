import mongoose from "mongoose";

const expertRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
      default: "",
    },

    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
      maxlength: 30,
    },

    preferredBranch: {
      type: String,
      enum: ["Bengaluru", "Puttur", "Madikeri", ""],
      default: "",
    },

    question: {
      type: String,
      required: [true, "Customer question is required."],
      trim: true,
      maxlength: 2000,
    },

    conversationContext: {
      type: [
        {
          sender: {
            type: String,
            enum: ["customer", "bot"],
            required: true,
          },

          text: {
            type: String,
            required: true,
            maxlength: 2000,
          },
        },
      ],

      default: [],
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    productCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    productName: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      enum: ["Chatbot", "Product", "General"],
      default: "Chatbot",
    },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "In Progress",
        "Resolved",
        "Closed",
      ],
      default: "New",
    },

    priority: {
      type: String,
      enum: ["Low", "Normal", "High"],
      default: "Normal",
    },

    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },

    internalNotes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

expertRequestSchema.index({
  status: 1,
  createdAt: -1,
});

expertRequestSchema.index({
  phone: 1,
});

expertRequestSchema.index({
  email: 1,
});

const ExpertRequest = mongoose.model(
  "ExpertRequest",
  expertRequestSchema
);

export default ExpertRequest;