import Category from "../model/Category.js";
import generateSlug from "../helper/slugyfi.js";
import News from "../model/News.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const slug = generateSlug(name);

    const existing = await Category.findOne({ slug });

    if (existing) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
    });

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      data: categories,
    });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      data: category,
    });
  } catch (error) {
    console.error("getCategoryById error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (name) {
      category.name = name;
      category.slug = generateSlug(name);
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (typeof isActive === "boolean") {
      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    //check if category is used in any news
    const isUsed = await News.exists({ category: id });

    if (isUsed) {
      return res.status(400).json({
        message: "Cannot delete category.It is used in news",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
