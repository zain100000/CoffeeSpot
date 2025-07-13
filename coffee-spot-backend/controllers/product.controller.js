const Product = require("../models/product.model");
const cloudinaryUpload = require("../utilities/cloudinary/cloudinary.utility");

// Only SuperAdmin can add product
exports.addProduct = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can add products",
      });
    }

    const { title, description, price, category } = req.body;

    if (!req.files?.productImage) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const imageUploadResult = await cloudinaryUpload.uploadToCloudinary(
      req.files.productImage[0],
      "productImage"
    );

    const product = new Product({
      title,
      description,
      price,
      category,
      productImage: imageUploadResult.url,
      addedBy: req.user.id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all products (accessible to all)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("addedBy");

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single product by ID (accessible to all)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("addedBy");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Only SuperAdmin can update product
exports.updateProduct = async (req, res) => {
  try {
    // Check if the user is a SUPERADMIN
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can update products.",
      });
    }

    const { id } = req.params;
    const { addedBy, ...updates } = req.body; // Exclude addedBy from updates

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    // If a new product image is provided, upload it to Cloudinary
    if (req.files?.productImage) {
      const productImageUploadResult =
        await cloudinaryUpload.uploadToCloudinary(
          req.files.productImage[0],
          "productImage"
        );
      updates.productImage = productImageUploadResult.url;
    }

    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
    });

    // Return success response with the updated product
    res.status(201).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Only SuperAdmin can delete product
exports.deleteProduct = async (req, res) => {
  try {
    // Check if the user is a SUPERADMIN
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can delete products.",
      });
    }

    const { id } = req.params;

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    // Delete product image from Cloudinary if it exists
    if (product.productImage) {
      await cloudinaryUpload.deleteFromCloudinary(
        product.productImage,
        "CoffeeSpot/productImage"
      );
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(id);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error Deleting Product:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
