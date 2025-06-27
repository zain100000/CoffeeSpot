const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const productImageUpload = require("../utilities/cloudinary/cloudinary.utility");
const productController = require("../controllers/product.controller");

// Route to add product
router.post(
  "/add-product",
  protect,
  productImageUpload.upload,
  productController.addProduct
);

// Route to get all products
router.get("/get-all-products", productController.getAllProducts);

// Route to get product by id
router.get("/get-product-by-id/:id", productController.getProductById);

// Route to update product
router.patch(
  "/update-product/:id",
  protect,
  productImageUpload.upload,
  productController.updateProduct
);

// Route to delete product
router.delete("/delete-product/:id", protect, productController.deleteProduct);

module.exports = router;
