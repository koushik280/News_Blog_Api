import mongoose from "mongoose";
import generateSlug from "../helper/slugyfi.js";
import News from "../model/News.js";
import cloudinary from "../config/cloudinary.js";
import Category from "../model/Category.js";

/**
 * Public: Read news (all / single / category / pagination)
 */
export const getNews = async (req, res) => {
  try {
    const {
      id,
      slug,
      category,
      page,
      limit,
      search,
      sort,
      startDate,
      endDate,
    } = req.query;
    if (startDate && isNaN(new Date(startDate))) {
      return res.status(400).json({ message: "Invalid startDate" });
    }

    if (endDate && isNaN(new Date(endDate))) {
      return res.status(400).json({ message: "Invalid endDate" });
    }

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
      let categoryId = null;
      query.category = category;
      //case1:if it is an valid category id
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = category;
      } else {
        //case2:Treat as slug
        const categoryDoc = await Category.find({ slug: category });
        if (!categoryDoc) {
          return res.status(200).json({
            data: [],
            message: "No news found for this category",
          });
        }
        categoryId = categoryDoc._id;
      }

      query.category = categoryId;
    }

    // Check if pagination is requested
    const isPaginationRequested = page || limit;

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          content: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    let sortOption = { publishedAt: -1 }; // default = latest

    if (sort) {
      switch (sort) {
        case "latest":
          sortOption = { publishedAt: -1 };
          break;

        case "oldest":
          sortOption = { publishedAt: 1 };
          break;

        case "title_asc":
          sortOption = { title: 1 };
          break;

        case "title_desc":
          sortOption = { title: -1 };
          break;

        default:
          sortOption = { publishedAt: -1 };
      }
    }

    if (startDate || endDate) {
      query.publishedAt = {};

      if (startDate) {
        query.publishedAt.$gte = new Date(startDate);
      }

      if (endDate) {
        query.publishedAt.$lte = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.publishedAt.$lte = end;
      }
    }

    let newsQuery = News.find(query)
      .populate("category", "name slug")
      .sort({ sortOption });

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
  } catch (error) {
    console.error("Error in getNews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getNewsByBody = async (req, res) => {
  try {
    const {
      id,
      slug,
      category,
      page,
      limit,
      search,
      sort,
      startDate,
      endDate,
    } = req.body;

    if (startDate && isNaN(new Date(startDate))) {
      return res.status(400).json({ message: "Invalid startDate" });
    }

    if (endDate && isNaN(new Date(endDate))) {
      return res.status(400).json({ message: "Invalid endDate" });
    }

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
    if (category) {
      let categoryId = null;

      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category });

        if (!categoryDoc) {
          return res.status(200).json({
            data: [],
            message: "No news found for this category",
          });
        }

        categoryId = categoryDoc._id;
      }

      query.category = categoryId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { publishedAt: -1 }; // default = latest

    if (sort) {
      switch (sort) {
        case "latest":
          sortOption = { publishedAt: -1 };
          break;

        case "oldest":
          sortOption = { publishedAt: 1 };
          break;

        case "title_asc":
          sortOption = { title: 1 };
          break;

        case "title_desc":
          sortOption = { title: -1 };
          break;

        default:
          sortOption = { publishedAt: -1 };
      }
    }

    if (startDate || endDate) {
      query.publishedAt = {};

      if (startDate) {
        query.publishedAt.$gte = new Date(startDate);
      }

      if (endDate) {
        query.publishedAt.$lte = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.publishedAt.$lte = end;
      }
    }

    let newsQuery = News.find(query).sort({ sortOption });
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
  } catch (error) {
    console.error("Error in getNewsByBody:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createNews = async (req, res) => {
  try {
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

    

    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category);
    } else {
      categoryDoc = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
      });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc || !categoryDoc.isActive) {
      return res.status(400).json({
        message: "Invalid or inactive Category",
      });
    }

     const publishStatus = isPublished === true || isPublished === "true";


    const news = await News.create({
      title,
      slug,
      content,
      category: categoryDoc._id,
      author: req.user.userId,
      isPublished: publishStatus,
      publishedAt: publishStatus ? new Date() : null,
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
  } catch (error) {
    console.error("Error in createNews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, content, category, isPublished } = req.body;

    if (category) {
      const categoryDoc = await Category.findById(category);

      if (!categoryDoc || !categoryDoc.isActive) {
        return res.status(400).json({
          message: "Invalid or inactive category",
        });
      }

      news.category = categoryDoc._id;
    }

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
  } catch (error) {
    console.error("Error in updateNews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNews = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error in deleteNews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
