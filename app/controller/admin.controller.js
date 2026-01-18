import User from "../model/User.js";
import News from "../model/News.js"

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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const role = req.query.role;

  const skip = (page - 1) * limit;

  // role filter
  const filter = {};
  if (role) {
    filter.role = role;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password") //never expose password
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    User.countDocuments(filter),
  ]);

  res.status(200).json({
    message: "Users fetched successfully",
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  });
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
