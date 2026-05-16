const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true, 
    },

    description: {
      type: String,
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: String,
      default: "",
    },

    sku: {
      type: String,
      unique: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    thumbnail: {
      type: String,
      default: "",
    },

    colors: [
      {
        type: String,
      },
    ],

    sizes: [
      {
        type: String,
      },
    ],

    tags: [
      {
        type: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    weight: {
      type: Number,
      default: 0,
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    warranty: {
      type: String,
      default: "",
    },

    returnPolicy: {
      type: String,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },

    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
