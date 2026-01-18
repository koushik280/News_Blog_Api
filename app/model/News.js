import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "politics",
        "sports",
        "technology",
        "business",
        "health",
        "entertainment",
      ],
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    image: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound index for fast public queries
 */
newsSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });

const News = mongoose.model("News", newsSchema);

export default News;
