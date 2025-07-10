const Cart = require("../models/cart.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId)
    ]);

    if (!user || !product) {
      return res.status(404).json({ 
        success: false, 
        message: !user ? "User not found" : "Product not found" 
      });
    }

    let cartItem = await Cart.findOne({ userId, productId });
    const userCartExists = user.cart.some(item => item.productId.toString() === productId);

    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.price = cartItem.quantity * product.price;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId,
        productId,
        quantity: 1,
        unitPrice: product.price,
        price: product.price,
      });
      await cartItem.save();
    }

    if (!userCartExists) {
      user.cart.push({
        productId: product._id,
        quantity: 1,
        unitPrice: product.price,
        price: product.price,
      });
    } else {
      const cartIndex = user.cart.findIndex(item => item.productId.toString() === productId);
      user.cart[cartIndex].quantity += 1;
      user.cart[cartIndex].price = user.cart[cartIndex].quantity * product.price;
    }
    await user.save();

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cart: cartItem,
    });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId)
    ]);

    if (!user || !product) {
      return res.status(404).json({ 
        success: false, 
        message: !user ? "User not found" : "Product not found" 
      });
    }

    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      return res.status(400).json({ 
        success: false, 
        message: "Product not in cart" 
      });
    }

    const userCartIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    if (userCartIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        message: "Product not in user cart" 
      });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      cartItem.price = cartItem.quantity * product.price;
      await cartItem.save();
      
      user.cart[userCartIndex].quantity -= 1;
      user.cart[userCartIndex].price = user.cart[userCartIndex].quantity * product.price;
      await user.save();
    } else {
      await Cart.findByIdAndDelete(cartItem._id);
      user.cart.splice(userCartIndex, 1);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Product quantity updated in cart",
    });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear all quantities of a product from cart
exports.removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    const result = await Cart.deleteMany({ userId, productId });
    if (result.deletedCount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Product not found in cart" 
      });
    }

    const user = await User.findById(userId);
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Product completely removed from cart",
    });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.user.id })
      .populate("productId")
      .populate("userId");

    res.status(201).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};