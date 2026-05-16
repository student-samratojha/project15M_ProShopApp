const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
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

    image: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    keywords: [
      {
        type: String,
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
