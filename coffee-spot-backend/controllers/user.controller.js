const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const jwt = require("jsonwebtoken");
const { v2: cloudinary } = require("cloudinary");
const { verifiedPhones } = require("../controllers/otp.controller");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { userName, email, password, phone, address, cart, orders } =
      req.body;

    if (!verifiedPhones.has(phone)) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified. Please verify OTP first.",
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User With This Phone Number Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userProfileImageUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await profilePictureUpload.uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      userProfileImageUrl = uploadResult.url;
    }

    const user = new User({
      profilePicture: userProfileImageUrl,
      userName,
      email,
      password: hashedPassword,
      phone,
      address,
      cart,
      orders,
      role: "USER",
      isVerified: true,
    });

    await user.save();
    verifiedPhones.delete(phone);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.error("Error During Registration:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password!",
      });
    }

    const payload = {
      role: "USER",
      user: {
        id: user.id,
        email: user.email,
        userName: user.name,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error Generating Token!",
        });
      }

      res.json({
        success: true,
        message: "User Login Successfully",
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
        },
        token,
      });
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Logging In!",
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    res.json({
      success: true,
      message: "User Fetched Successfully",
      user: user,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting User!",
    });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old Password is incorrect!",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Resetting Password!",
    });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (req.body.userName) user.userName = req.body.userName;
    if (req.body.address) user.address = req.body.address;

    // Handle profile picture update
    if (req.files && req.files.profilePicture) {
      const newProfilePicture = req.files.profilePicture[0];

      if (user.profilePicture) {
        try {
          const publicId = user.profilePicture.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(
            `CoffeeSpot/profilePictures/${publicId}`
          );
        } catch (error) {
          console.error("❌ Error deleting old profile picture:", error);
        }
      }

      const result = await profilePictureUpload.uploadToCloudinary(
        newProfilePicture,
        "profilePicture"
      );

      user.profilePicture = result.url;
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User Updated Successfully.",
      user,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Logout user
exports.logoutUser = async (req, res, next) => {
  try {
    const userId = req.userId; // Get userId from the request object (attached by the middleware)

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the lastActive timestamp before logging out
    user.lastActive = new Date();

    // Set user as offline
    user.isOnline = false;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User Logout Successfully!",
      token: null, // Clear the JWT token on logout
    });
  } catch (err) {
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(
          `CoffeeSpot/profilePictures/${publicId}`
        );
      } catch (error) {
        console.error("❌ Error deleting profile picture:", error);
      }
    }

    await User.findByIdAndDelete(id);

    res.status(201).json({
      success: true,
      message: "User profile and all associated data deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error deleting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
