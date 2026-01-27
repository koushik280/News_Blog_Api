import User from "../model/User.js";
import News from "../model/News.js";

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  //validate Role
  const allowedRoles = ["user", "editor", "admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid Roles",
    });
  }
  //Prevent admin from demonating themselves

  if (req.user.userId === id && role !== "admin") {
    return res.status(400).json({
      message: "Admin cannot change their own role",
    });
  }

  //update Role
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User role updated successfully",
    data: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
};

export const listUsers = async (req, res) => {
  const { page, limit, role } = req.query;

  // Role filter
  const filter = {};
  if (role) {
    filter.role = role;
  }

  // Check if pagination is requested
  const isPaginationRequested = page || limit;

  let userQuery = User.find(filter).select("-password").sort({ createdAt: -1 });

  let pagination = null;

  if (isPaginationRequested) {
    const pageNumber = parseInt(page || 1, 10);
    const pageLimit = parseInt(limit || 10, 10);
    const skip = (pageNumber - 1) * pageLimit;

    const total = await User.countDocuments(filter);

    userQuery = userQuery.skip(skip).limit(pageLimit);

    pagination = {
      total,
      page: pageNumber,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    };
  }

  const users = await userQuery;

  res.status(200).json({
    message: "Users fetched successfully",
    data: users,
    ...(pagination && { pagination }),
  });
};

export const filterUsersByBody = async (req, res) => {
  try {
    const { page, limit, role, search } = req.body;

    const filter = {};

    // Role filter
    if (role) {
      filter.role = role;
    }

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const isPaginationRequested = page || limit;

    let userQuery = User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    let pagination = null;

    if (isPaginationRequested) {
      const pageNumber = parseInt(page || 1, 10);
      const pageLimit = parseInt(limit || 10, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const total = await User.countDocuments(filter);

      userQuery = userQuery.skip(skip).limit(pageLimit);

      pagination = {
        total,
        page: pageNumber,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      };
    }

    const users = await userQuery;

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
      ...(pagination && { pagination }),
    });
  } catch (error) {
    console.error("POST /api/admin/users/filter error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * Admin: Delete user with cascade delete (news + images)
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  // 1️⃣ Prevent self-delete
  if (req.user.userId === id) {
    return res.status(400).json({
      message: "Admin cannot delete their own account",
    });
  }

  // 2️⃣ Find user
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // 3️⃣ Prevent deleting last admin
  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({
        message: "Cannot delete the last admin",
      });
    }
  }

  // 4️⃣ Find all news authored by user
  const userNews = await News.find({ author: user._id });

  // 5️⃣ Delete Cloudinary images (if any)
  for (const news of userNews) {
    if (news.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(news.image.public_id);
      } catch (err) {
        console.error(
          `Failed to delete image for news ${news._id}:`,
          err.message,
        );
      }
    }
  }

  // 6️⃣ Delete all user's news
  await News.deleteMany({ author: user._id });

  // 7️⃣ Delete user
  await user.deleteOne();

  // 8️⃣ Response
  res.status(200).json({
    message: "User and related news deleted successfully",
    summary: {
      deletedUser: user.email,
      deletedNewsCount: userNews.length,
    },
  });
};

/**
 * Admin: Disable user
 */
export const disableUser = async (req, res) => {
  const { id } = req.params;

  // prevent self-disable
  if (req.user.userId === id) {
    return res.status(400).json({
      message: "Admin cannot disable their own account",
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.isActive) {
    return res.status(400).json({
      message: "User is already disabled",
    });
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    message: "User disabled successfully",
    data: {
      id: user._id,
      email: user.email,
      isActive: user.isActive,
    },
  });
};

/**
 * Admin: Enable user
 */
export const enableUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isActive) {
    return res.status(400).json({
      message: "User is already active",
    });
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    message: "User enabled successfully",
    data: {
      id: user._id,
      email: user.email,
      isActive: user.isActive,
    },
  });
};

//Admin can get all the news data published and not published as well
export const adminGetAllNews = async (req, res) => {
  const { category, page, limit, isPublished } = req.query;

  const query = {};

  // Optional filters
  if (category) query.category = category;

  if (typeof isPublished !== "undefined") {
    query.isPublished = isPublished === "true";
  }

  let newsQuery = News.find(query).sort({ createdAt: -1 });

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
      totalPages: Math.ceil(totalResults / pageLimit),
      totalResults,
    };
  }

  const news = await newsQuery;

  res.status(200).json({
    data: news,
    ...(pagination && { pagination }),
  });
};


export const togglePublishStatus = async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  const news = await News.findById(id);

  if (!news) {
    return res.status(404).json({
      message: "News not found",
    });
  }

  // Convert to boolean
  const publishValue = isPublished === true || isPublished === "true";

  news.isPublished = publishValue;
  news.publishedAt = publishValue ? new Date() : null;

  await news.save();

  res.status(200).json({
    message: publishValue
      ? "News published successfully"
      : "News unpublished successfully",
    data: news,
  });
};


