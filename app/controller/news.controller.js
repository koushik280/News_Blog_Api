import mongoose from "mongoose";
import generateSlug from "../helper/slugyfi.js";
import News from "../model/News.js";

/**
 * Public: Read news (all / single / category / pagination)
 */
export const getNews = async (req, res) => {
  const { id, slug, category, page, limit } = req.query;

  // Base query: only published news
  const query = { isPublished: true };

  // Single news by ID
  if (id) {
    query._id = id;
  }

  // Single news by slug
  if (slug) {
    query.slug = slug;
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Check if pagination is requested
  const isPaginationRequested = page || limit;

  let newsQuery = News.find(query).sort({ publishedAt: -1 });

  let pagination = null;

  if (isPaginationRequested) {
    const pageNumber = parseInt(page || 1, 10);
    const pageLimit = parseInt(limit || 10, 10);
    const skip = (pageNumber - 1) * pageLimit;

    const totalResults = await News.countDocuments(query);

    newsQuery = newsQuery.skip(skip).limit(pageLimit);

    pagination = {
      page: pageNumber,
      limit: pageLimit,
      totalPages: Math.ceil(totalResults / pageLimit),
      totalResults,
    };
  }

  const news = await newsQuery;

  // If single news requested but not found
  if ((id || slug) && news.length === 0) {
    return res.status(404).json({ message: "News not found" });
  }

  // Final response
  res.status(200).json({
    data: news,
    ...(pagination && { pagination }),
  });
};

export const getNewsByBody = async (req, res) => {
  const { id, slug, category, page, limit } = req.body;

  const query = { isPublished: true };
  // ✅ Validate ObjectId
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid news id",
      });
    }
    query._id = id;
  }
  if (slug) query.slug = slug;
  if (category) query.category = category;

  let newsQuery = News.find(query).sort({ publishedAt: -1 });
  let pagination = null;

  if (page || limit) {
    const pageNumber = parseInt(page || 1, 10);
    const pageLimit = parseInt(limit || 10, 10);
    const skip = (pageNumber - 1) * pageLimit;

    const totalResults = await News.countDocuments(query);
    newsQuery = newsQuery.skip(skip).limit(pageLimit);

    pagination = {
      page: pageNumber,
      limit: pageLimit,
      totalResults,
      totalPages: Math.ceil(totalResults / pageLimit),
    };
  }

  const news = await newsQuery;

  res.status(200).json({
    data: news,
    ...(pagination && { pagination }),
  });
};

export const createNews = async (req, res) => {
  const { title, content, category, isPublished } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      message: "Title, content, and category are required",
    });
  }

  const slug = generateSlug(title);

  const existing = await News.findOne({ slug });
  if (existing) {
    return res.status(409).json({
      message: "News with similar title already exists",
    });
  }

  const news = await News.create({
    title,
    slug,
    content,
    category,
    author: req.user.userId,
    isPublished: Boolean(isPublished),
    publishedAt: isPublished ? new Date() : null,
  });

  //
  if (req.file) {
    news.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };
    await news.save();
  }

  res.status(201).json({
    message: "News created successfully",
    data: news,
  });
};

export const updateNews = async (req, res) => {
  const { id } = req.params;
  let { title, content, category, isPublished } = req.body;

  const allowedCategories = [
    "sports",
    "technology",
    "business",
    "politics",
    "health",
  ];

  const news = await News.findById(id);
  if (!news) {
    return res.status(404).json({ message: "News not found" });
  }

  // ❗ Validate category explicitly
  if (category && !allowedCategories.includes(category)) {
    return res.status(400).json({
      message: `Invalid category. Allowed values: ${allowedCategories.join(", ")}`,
    });
  }

  // ❗ Convert isPublished from string → boolean
  if (typeof isPublished !== "undefined") {
    isPublished = isPublished === "true" || isPublished === true;
  }

  // Update fields only if provided
  if (title) news.title = title;
  if (content) news.content = content;
  if (category) news.category = category;

  if (typeof isPublished === "boolean") {
    news.isPublished = isPublished;
    news.publishedAt = isPublished ? new Date() : null;
  }

  // Handle image update
  if (req.file) {
    if (news.image?.public_id) {
      await cloudinary.uploader.destroy(news.image.public_id);
    }

    news.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  await news.save();

  res.status(200).json({
    message: "News updated successfully",
    data: news,
  });
};

export const deleteNews = async (req, res) => {
  const { id } = req.params;

  // Find the news first
  const news = await News.findById(id);

  if (!news) {
    return res.status(404).json({
      message: "News not found",
    });
  }

  //Delete image from Cloudinary if exists
  if (news.image && news.image.public_id) {
    try {
      await cloudinary.uploader.destroy(news.image.public_id);
    } catch (error) {
      // Log error but DO NOT block deletion
      console.error("Cloudinary delete failed:", error.message);
    }
  }

  //Delete news from database
  await news.deleteOne();

  //Respond
  res.status(200).json({
    message: "News and image deleted successfully",
  });
};
