const { auditLog } = require("../helper/audit.helper");
const userModel = require("../db/models/user.model");
const productModel = require("../db/models/product.model");
const categoryModel = require("../db/models/category.model");

async function getMakeCategory(req, res) {
  try {
    const category = await categoryModel.find({ employee: req.user._id });
    if (category.length > 0) {
      await auditLog(
        req,
        res,
        "Access Make Category Page",
        "Employee accessed category creation page",
      );
      return res.redirect(
        "/secure/employee?error=You already have a category associated with your account",
      );
    }
    res.render("makeCategory", {
      user: req.user,
    });
  } catch (error) {
    console.error("Get Make Category Error:", error.message);
    res.redirect(
      "/secure/employee?error=Unable to load category creation page",
    );
  }
}
async function createCategory(req, res) {
  try {
    const {
      title,
      slug,
      description,
      image,
      bannerImage,
      isFeatured,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
      keywords,
    } = req.body;

    // =========================
    // REQUIRED VALIDATION
    // =========================
    if (!title) {
      await auditLog(
        req,
        res,
        "category_create_failed",
        "Category title is required",
        false,
        "warning",
      );

      return res.redirect("/secure/employee?error=Category title is required");
    }

    // =========================
    // CHECK EXISTING CATEGORY
    // =========================
    const existingCategory = await categoryModel.findOne({
      title: title.trim(),
    });

    if (existingCategory) {
      await auditLog(
        req,
        res,
        "category_create_failed",
        "Category already exists",
        false,
        "warning",
      );

      return res.redirect("/secure/employee?error=Category already exists");
    }

    // =========================
    // GENERATE SLUG
    // =========================
    const generatedSlug = slug
      ? slug.toLowerCase().trim()
      : title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");

    // =========================
    // CREATE CATEGORY
    // =========================
    const newCategory = await categoryModel.create({
      title: title.trim(),

      slug: generatedSlug,

      description,

      image,

      bannerImage,

      employee: req.user?._id,

      isFeatured: isFeatured || false,

      status: status || "active",

      sortOrder: sortOrder || 0,

      metaTitle,

      metaDescription,

      keywords: keywords.split(",").map((kw) => kw.trim())|| [],
    });

    // =========================
    // AUDIT LOG
    // =========================
    await auditLog(
      req,
      res,
      "category_created",
      `Category created: ${newCategory.title}`,
      true,
      "info",
    );

    // =========================
    // RESPONSE
    // =========================
    return res.redirect(
      "/secure/employee?success=Category created successfully",
    );
  } catch (error) {
    console.error("Create Category Error:", error.message);

    await auditLog(
      req,
      res,
      "category_create_error",
      error.message,
      false,
      "critical",
    );

    return res.redirect("/secure/employee?error=Unable to create category");
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.body;
    const category = await categoryModel.findById(id);
    if (!category) {
      await auditLog(
        req,
        res,
        "category_delete_failed",
        `Category with ID ${id} not found`,
        false,
        "warning",
      );
      return res.redirect("/secure/admin?error=Category not found");
    }
    await categoryModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    await auditLog(
      req,
      res,
      "category_deleted",
      `Category with ID ${id} deleted`,
      false,
      "warning",
    );
    return res.redirect("/secure/admin?Deleted_Category");
  } catch (error) {
    console.error("Delete Category Error:", error.message);

    await auditLog(
      req,
      res,
      "category_delete_error",
      error.message,
      false,
      "critical",
    );
    return res.redirect("/secure/admin?error=Unable to delete category");
  }
}

async function editCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      await auditLog(
        req,
        res,
        "category_edit_failed",
        `Category with ID ${id} not found`,
        false,
        "warning",
      );
      return res.redirect("/secure/employee?error=Category not found");
    }
    if (category.employee.toString() !== req.user._id.toString()) {
      await auditLog(
        req,
        res,
        "category_edit_failed",
        `User is not authorized to edit this category`,
        false,
        "warning",
      );
      return res.redirect(
        "/secure/employee?error=You are not authorized to edit this category",
      );
    }
    res.render("editCategory", {
      category,
    });
  } catch (error) {
    console.error("Edit Category Error:", error.message);

    await auditLog(
      req,
      res,
      "category_edit_error",
      error.message,
      false,
      "critical",
    );
    return res.redirect("/secure/admin?error=Unable to edit category");
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      slug,
      description,
      image,
      bannerImage,
      isFeatured,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
      keywords,
    } = req.body;

    // =========================
    // FIND CATEGORY
    // =========================
    const category = await categoryModel.findById(id);

    if (!category) {
      await auditLog(
        req,
        res,
        "category_update_failed",
        `Category with ID ${id} not found`,
        false,
        "warning",
      );

      return res.redirect("/secure/employee?error=Category not found");
    }

    // =========================
    // AUTHORIZATION CHECK
    // =========================
    if (
      category.employee &&
      category.employee.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      await auditLog(
        req,
        res,
        "category_update_failed",
        "Unauthorized category update attempt",
        false,
        "warning",
      );

      return res.redirect(
        "/secure/employee?error=You are not authorized to update this category",
      );
    }

    // =========================
    // TITLE VALIDATION
    // =========================
    if (!title) {
      await auditLog(
        req,
        res,
        "category_update_failed",
        "Category title is required",
        false,
        "warning",
      );

      return res.redirect("/secure/employee?error=Category title is required");
    }

    // =========================
    // CHECK EXISTING TITLE
    // =========================
    const existingCategory = await categoryModel.findOne({
      title: title.trim(),
      _id: { $ne: id },
    });

    if (existingCategory) {
      await auditLog(
        req,
        res,
        "category_update_failed",
        "Category title already exists",
        false,
        "warning",
      );

      return res.redirect(
        "/secure/employee?error=Category title already exists",
      );
    }

    // =========================
    // GENERATE SLUG
    // =========================
    const generatedSlug = slug
      ? slug.toLowerCase().trim()
      : title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");

    // =========================
    // UPDATE CATEGORY
    // =========================
    category.title = title.trim();

    category.slug = generatedSlug;

    category.description = description || "";

    category.image = image || "";

    category.bannerImage = bannerImage || "";

    category.isFeatured = isFeatured || false;

    category.status = status || "active";

    category.sortOrder = sortOrder || 0;

    category.metaTitle = metaTitle || "";

    category.metaDescription = metaDescription || "";

    category.keywords = keywords || [];

    // =========================
    // SAVE CATEGORY
    // =========================
    await category.save();

    // =========================
    // AUDIT LOG
    // =========================
    await auditLog(
      req,
      res,
      "category_updated",
      `Category updated: ${category.title}`,
      true,
      "info",
    );

    // =========================
    // RESPONSE
    // =========================
    return res.redirect(
      "/secure/employee?success=Category updated successfully",
    );
  } catch (error) {
    console.error("Update Category Error:", error.message);

    await auditLog(
      req,
      res,
      "category_update_error",
      error.message,
      false,
      "critical",
    );

    return res.redirect("/secure/employee?error=Unable to update category");
  }
}
module.exports = {
  getMakeCategory,
  createCategory,
  deleteCategory,
  editCategory,
  updateCategory,
};
