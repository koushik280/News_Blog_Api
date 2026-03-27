import Category from "../model/Category.js";

export const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name slug")
      .sort({ createdAt: -1 });
    res.status(200).json({
      data: categories,
    });
  } catch (error) {
    console.error("getPublicCategories error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
