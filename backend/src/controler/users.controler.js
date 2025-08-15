// controllers/auth.controller.js
import { User } from "../modles/users.models.js";
import asyncHandler from "../utils/asynchandler.js";

//  REGISTER
export const registerUser = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  // Image path agar file upload hui hai
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Input validation
  const errors = {};
  if (!name?.trim()) errors.name = "Name is required";
  if (!phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(phone)) {
    errors.phone = "Phone number must be 10 digits";
  }
  if (!password?.trim()) errors.password = "Password is required";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    // Check for existing user
    if (await User.findOne({ phone })) {
      return res.status(400).json({ 
        success: false, 
        errors: { phone: "Phone number already registered" } 
      });
    }

    // Create user (image optional)
    const user = await User.create({ 
      name: name.trim(),
      phone: phone.trim(),
      password,
      image: imagePath // image null bhi ho sakti hai
    });

    // Generate token
    const token = user.generateAccessToken();

    // Successful response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        image: user.image
      },
      token,
    });

  } catch (error) {
    if (error.code === 11000) {
      console.error("Database index conflict:", error.message);
      return res.status(500).json({
        success: false,
        error: "Registration failed due to system configuration. Please contact support."
      });
    }
    
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Registration failed. Please try again."
    });
  }
});

//  LOGIN (using phone + password)
export const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const errors = {};

  if (!phone || phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(phone)) {
    errors.phone = "Phone number must be 10 digits";
  }
  if (!password || password.trim() === "") {
    errors.password = "Password is required";
  }

  // Return validation errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Find user by phone
  const user = await User.findOne({ phone });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, errors: { phone: "User with this phone number not found" } });
  }

  // Compare password
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, errors: { password: "Password is incorrect" } });
  }

  // Generate token
  const token = user.generateAccessToken();

  // Cookie options (safe for local & prod)
  const cookieOptions = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };

  // Send token in both cookie and JSON
  res
    .cookie("accessToken", token, cookieOptions)
    .status(200)
    .json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        accessToken: token
      },
    });
});

export const verifyPasswordAndGetBalance = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user?._id; // assuming JWT middleware sets req.user

  const errors = {};

  // Validation
  if (!password || password.trim() === "") {
    errors.password = "Password is required";
    return res.status(400).json({ success: false, errors });
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, errors: { general: "User not found" } });
  }

  // Verify password
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, errors: { password: "Password is incorrect" } });
  }

  // Return balance
  return res.status(200).json({
    success: true,
    message: "Password verified successfully",
    balance: user.balance,
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  // Clear the cookie by setting it to empty and expired
  res
    .cookie("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      expires: new Date(0) // set expiry in past
    })
    .status(200)
    .json({
      success: true,
      message: "Logout successful"
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  // Current user ka detail (image included)
  const currentUser = await User.findById(loggedInUserId, {
    name: 1,
    phone: 1,
    balance: 1,
    image: 1
  });

  // Other Users data (image included)
  const otherUsers = await User.find(
    { _id: { $ne: loggedInUserId } },
    { name: 1, phone: 1, balance: 1, image: 1 }
  );

  res.status(200).json({
    success: true,
    currentUser,
    users: otherUsers
  });
});


// @route   POST /api/transfer/initiate
export const initiateTransfer = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  // Convert amount to number
  const amt = Number(amount);

  // Validate amount only
  if (!amt || isNaN(amt) || amt <= 0) {
    return res.status(400).json({
      success: false,
      error: "Enter a valid amount (> ₹0)"
    });
  }

  res.status(200).json({
    success: true,
    message: "Amount is valid. Proceed to next step.",
    data: { amount: amt }
  });
});




export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // from verifyToken middleware

    // Fetch user with balance included
    const user = await User.findById(userId).select("name phone image balance");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
});


export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // from verifyToken middleware
    const { name, phone } = req.body;
    let image = req.body.image; // If base64 or image URL

    // Optional: If using file upload (multer)
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Update only allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, image },
      { new: true, runValidators: true }
    ).select("name phone image balance");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

export const getUserImage = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // from verifyToken middleware

    const user = await User.findById(userId).select("image");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { image: user.image },
    });
  } catch (error) {
    console.error("Profile image fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile image",
    });
  }
});

// @route   POST /api/transfer/confirm


export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id; // Assuming user is authenticated via token middleware

  // Validation
  const errors = {};
  if (!oldPassword?.trim()) errors.oldPassword = "Old password is required";
  if (!newPassword?.trim()) {
    errors.newPassword = "New password is required";
  } else if (newPassword.length < 4) {
    errors.newPassword = "Password must be at least 4 characters";
  }
  if (!confirmPassword?.trim()) {
    errors.confirmPassword = "Confirm password is required";
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check old password
    const isMatch = await user.isPasswordCorrect(oldPassword); // assuming you have a method for comparing
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        errors: { oldPassword: "Old password is incorrect" },
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update password. Please try again.",
    });
  }
});
