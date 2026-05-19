const productModel = require("../db/models/product.model");
const categoryModel = require("../db/models/category.model");
const auditHelper = require("../helper/audit.helper");
const userModel = require("../db/models/user.model");
const { sendNotification } = require("../helper/notification.helper");
async function getMakeProduct(req, res) {
  try {
    const category = await categoryModel.find({ employee: req.user._id });
    if (!category) {
      await auditHelper.auditLog(
        req,
        res,
        "make_product_failed",
        "Category not found",
        false,
        "warning",
      );
      return res.redirect("/employee/dashboard?make_product=false");
    }
    res.render("employee/makeProduct", {
      user: req.user,
      category: category,
    });
  } catch (error) {
    console.error("Get Make Product Error:", error.message);
    res.redirect("/employee/dashboard?make_product=false");
  }
}

async function createProduct(req, res) {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      category,
      brand,
      sku,
      stock,
      image,
      images,
      thumbnail,
      colors,
      sizes,
      tags,
      weight,
      length,
      width,
      height,
      shippingCharge,
      warranty,
      returnPolicy,
      isFeatured,
      isAvailable,
      status,
      metaTitle,
      metaDescription,
      keywords,
    } = req.body;
    const existingProduct = await productModel.findOne({
      name,
      employee: req.user._id,
      category,
    });
    if (existingProduct) {
      await auditHelper.auditLog(
        req,
        res,
        "product_create_failed",
        "Product with the same name already exists in this category",
        false,
        "warning",
      );
      return res.redirect(
        "/employee/dashboard?make_product=false&error=Product with the same name already exists in this category",
      );
    }
    const generatedSlug = slug
      ? slug.toLowerCase().trim()
      : name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");
    const newProduct = new productModel({
      name,
      slug: generatedSlug,
      description,
      shortDescription,
      price,
      discountPrice: discountPrice || 0,
      category,
      brand,
      sku,
      stock: stock || 0,
      images: images
        ? images.split(",").map((url) => url.trim())
        : image
          ? [image.trim()]
          : [],
      thumbnail,
      colors: colors ? colors.split(",").map((value) => value.trim()) : [],
      sizes: sizes ? sizes.split(",").map((value) => value.trim()) : [],
      tags: tags ? tags.split(",").map((value) => value.trim()) : [],
      weight: weight || 0,
      dimensions: {
        length: length || 0,
        width: width || 0,
        height: height || 0,
      },
      shippingCharge: shippingCharge || 0,
      warranty,
      returnPolicy,
      isFeatured: isFeatured === "true" || isFeatured === "on",
      isAvailable:
        typeof isAvailable === "undefined"
          ? true
          : isAvailable === "true" || isAvailable === "on",
      status,
      metaTitle,
      metaDescription,
      keywords: keywords ? keywords.split(",").map((kw) => kw.trim()) : [],
      employee: req.user._id,
    });
    await newProduct.save();
    await auditHelper.auditLog(
      req,
      res,
      "product_create_success",
      "Product created successfully",
      true,
      "info",
    );
    return res.redirect("/employee/dashboard?make_product=true");
  } catch (error) {
    console.error("Create Product Error:", error.message);
    await auditHelper.auditLog(
      req,
      res,
      "product_create_error",
      error.message,
      false,
      "critical",
    );
    return res.redirect(
      "/employee/dashboard?make_product=false&error=Unable to create product",
    );
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.body;
    const product = await productModel.findById(id);
    if (!product) {
      await auditHelper.auditLog(
        req,
        res,
        "product_delete_failed",
        "Product not found",
        false,
        "warning",
      );
      return res.redirect("/employee/dashboard?delete_product=false");
    }
    await productModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    await auditHelper.auditLog(
      req,
      res,
      "product_delete_success",
      "Product deleted successfully",
      true,
      "info",
    );
    return res.redirect("/employee/dashboard?delete_product=true");
  } catch (error) {
    console.log("Delete Product Error:", error.message);
    await auditHelper.auditLog(
      req,
      res,
      "product_delete_error",
      error.message,
      false,
      "critical",
    );
    return res.redirect("/employee/dashboard?delete_product=false");
  }
}

async function editProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      await auditHelper.auditLog(
        req,
        res,
        "product_edit_failed",
        "Product not found",
        false,
        "warning",
      );
      return res.redirect("/employee/dashboard?edit_product=false");
    }
    const category = await categoryModel.findOne({ employee: req.user._id });
    if (product.category.toString() !== category._id.toString()) {
      await auditHelper.auditLog(
        req,
        res,
        "product_edit_failed",
        "Unauthorized access",
        false,
        "warning",
      );
      return res.redirect(
        "/employee/dashboard?edit_product=false&error=Unauthorized access",
      );
    }
    res.render("employee/editProduct", {
      user: req.user,
      product: product,
      category: category,
    });
  } catch (error) {
    console.log("Edit Product Error:", error.message);
    await auditHelper.auditLog(
      req,
      res,
      "product_edit_error",
      error.message,
      false,
      "critical",
    );
    return res.redirect(
      "/employee/dashboard?edit_product=false&error=Unable to edit product",
    );
  }
}
async function updateProduct(req, res) {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      category,
      brand,
      sku,
      stock,
      images,
      thumbnail,
      colors,
      sizes,
      tags,
      weight,
      shippingCharge,
      warranty,
      returnPolicy,
      isFeatured,
      isAvailable,
      status,
      id,
      metaTitle,
      metaDescription,
    } = req.body;

    // =========================
    // FIND PRODUCT
    // =========================
    const product = await productModel.findById(id);

    if (!product) {
      await auditHelper.auditLog(
        req,
        res,
        "product_update_failed",
        "Product not found",
        false,
        "warning",
      );

      return res.redirect(
        "/employee/dashboard?update_product=false&error=Product not found",
      );
    }

    // =========================
    // VALIDATION
    // =========================
    if (!name || !price || !category) {
      await auditHelper.auditLog(
        req,
        res,
        "product_update_failed",
        "Required fields missing",
        false,
        "warning",
      );

      return res.redirect(
        "/employee/dashboard?update_product=false&error=Required fields missing",
      );
    }

    // =========================
    // CHECK SKU
    // =========================
    if (sku && sku !== product.sku) {
      const existingSKU = await productModel.findOne({
        sku,
        _id: { $ne: id },
      });

      if (existingSKU) {
        await auditHelper.auditLog(
          req,
          res,
          "product_update_failed",
          "SKU already exists",
          false,
          "warning",
        );

        return res.redirect(
          "/employee/dashboard?update_product=false&error=SKU already exists",
        );
      }
    }

    // =========================
    // GENERATE SLUG
    // =========================
    const generatedSlug = slug
      ? slug.toLowerCase().trim()
      : name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");

    // =========================
    // UPDATE PRODUCT
    // =========================
    product.name = name;

    product.slug = generatedSlug;

    product.description = description || "";

    product.shortDescription = shortDescription || "";

    product.price = price;

    product.discountPrice = discountPrice || 0;

    product.category = category;

    product.brand = brand || "";

    product.sku = sku || "";

    product.stock = stock || 0;

    product.images = images || [];

    product.thumbnail = thumbnail || "";

    product.colors = colors || [];

    product.sizes = sizes || [];

    product.tags = tags || [];

    product.weight = weight || 0;

    product.shippingCharge = shippingCharge || 0;

    product.warranty = warranty || "";

    product.returnPolicy = returnPolicy || "";

    product.isFeatured = isFeatured || false;

    product.isAvailable = isAvailable || true;

    product.status = status || "active";

    product.metaTitle = metaTitle || "";

    product.metaDescription = metaDescription || "";

    // =========================
    // SAVE PRODUCT
    // =========================
    await product.save();

    // =========================
    // AUDIT LOG
    // =========================
    await auditHelper.auditLog(
      req,
      res,
      "product_updated",
      `Product updated: ${product.name}`,
      true,
      "info",
    );

    // =========================
    // RESPONSE
    // =========================
    return res.redirect(
      "/employee/dashboard?update_product=true&success=Product updated successfully",
    );
  } catch (error) {
    console.log("Update Product Error:", error.message);

    await auditHelper.auditLog(
      req,
      res,
      "product_update_error",
      error.message,
      false,
      "critical",
    );

    return res.redirect(
      "/employee/dashboard?update_product=false&error=Unable to update product",
    );
  }
}

async function shopAtTop(req, res) {
  try {
    const { price = "all", stock, sort = "newest", category = "" } = req.query;
    const query = { isDeleted: false, status: "active" };

    if (category) {
      query.category = category;
    }

    if (price && price !== "all") {
      if (price === "0-500") {
        query.price = { $gte: 0, $lte: 500 };
      } else if (price === "500-1000") {
        query.price = { $gte: 500, $lte: 1000 };
      } else if (price === "1000-5000") {
        query.price = { $gte: 1000, $lte: 5000 };
      } else if (price === "5000+") {
        query.price = { $gte: 5000 };
      }
    }

    const stockFilters = Array.isArray(stock) ? stock : stock ? [stock] : [];
    if (stockFilters.length > 0) {
      const stockQuery = [];
      if (stockFilters.includes("instock")) {
        stockQuery.push({ stock: { $gt: 0 } });
      }
      if (stockFilters.includes("outofstock")) {
        stockQuery.push({ stock: 0 });
      }
      if (stockQuery.length > 0) {
        query.$or = stockQuery;
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-low") {
      sortOption = { price: 1 };
    } else if (sort === "price-high") {
      sortOption = { price: -1 };
    }

    const products = await productModel.find(query).sort(sortOption);
    const categories = await categoryModel.find({ isDeleted: false });

    res.render("shop", {
      user: req.user,
      products,
      categories,
      filters: {
        price,
        stock: stockFilters,
        sort,
        category,
      },
    });
  } catch (error) {
    console.error("Shop At Top Error:", error.message);
    res.redirect("/?error=Unable to load shop");
  }
}

async function employeeProductManage(req, res) {
  try {
    const userId = req.user.id;
    const category = await categoryModel.findOne({ employee: userId });

    const products = await productModel
      .find({ category: category ? category._id : null,isDeleted: false })
      .populate("category");
    const employee = await userModel.findById(userId);
    if (products.length === 0) {
      await auditHelper.auditLog(
        req,
        res,
        "Accessed Employee Product Management",
        `Employee ${employee.username} accessed the employee product management page but has no assigned products.`,
        false,
        "info",
      );
      return res.render("employee/employeeProducts", { products: [], employee });
    }
    auditHelper.auditLog(
      req,
      res,
      "Accessed Employee Product Management",
      `Employee ${employee.username} accessed the employee product management page.`,
      false,
      "info",
    );
    res.render("employee/employeeProducts", { products, employee });
  } catch (error) {
    console.error("Error fetching employee products:", error);
    res.redirect("/employee/dashboard?error=Unable to fetch products");
  }
}
async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = await userModel.findById(req.user._id);
    const product = await productModel.findById(productId);
    if (!user || !product) {
      await auditHelper.auditLog(
        req,
        res,
        "add_to_wishlist_failed",
        "User or product not found",
        false,
        "warning",
      );
      return res.redirect("/products/all?add_to_wishlist=false");
    }
    if (user.wishlist.includes(productId)) {
      user.wishlist.pull(productId);
      await user.save();
      await auditHelper.auditLog(
        req,
        res,
        "add_to_wishlist_success",
        "Product added to wishlist",
        true,
        "info",
      );
      await sendNotification(
        req.user._id,
        `Product "${product.name}" has been added to your wishlist.`,
        "wishlist",
        `/products/${productId}`,
      );
      return res.redirect("/products/all?add_to_wishlist=false");
    }
    user.wishlist.push(productId);
    await user.save();
    await auditHelper.auditLog(
      req,
      res,
      "add_to_wishlist_success",
      "Product added to wishlist",
      true,
      "info",
    );
    return res.redirect("/products/all?add_to_wishlist=true");
  } catch (error) {
    console.error("Add to Wishlist Error:", error.message);
    res.redirect("/products/all?add_to_wishlist=false");
  }
}
async function productDetails(req, res) {
  try {
    const product = await productModel.findById(req.params.id).populate("category");
    if (!product) {
      await auditHelper.auditLog(
        req,
        res,
        "product_details_failed",
        "Product not found",
        false,
        "warning",
      );
      return res.redirect("/products/all?product_details=false");
    }
    res.render("productDetails", { user: req.user || null, product });
  } catch (error) {
    console.error("Product Details Error:", error.message);
    res.redirect("/products/all?product_details=false");
  }
}


module.exports = {
  getMakeProduct,
  createProduct,
  productDetails,
  shopAtTop,
  addToWishlist,
  deleteProduct,
  editProduct,
  updateProduct,
  employeeProductManage,
};
