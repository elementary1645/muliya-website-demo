import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    collection: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: String,
      required: true,
    },

    weight: {
      type: String,
      required: true,
    },

    purity: {
      type: String,
      required: true,
    },

    availability: {
      type: String,
      default: "Available on enquiry",
    },

    image: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    trending: {
      type: Boolean,
      default: false,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    branchAvailability: {
      Bengaluru: {
        type: Boolean,
        default: false,
      },

      Puttur: {
        type: Boolean,
        default: false,
      },

      Madikeri: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;