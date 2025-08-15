import express from "express";
import { registerUser, loginUser, getAllUsers, initiateTransfer, getUserProfile, updateUserProfile,
getUserImage, logoutUser, updatePassword, verifyPasswordAndGetBalance } from "../controler/users.controler.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from "multer";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/register",  upload.single("image"), registerUser)
router.post("/login", loginUser)
router.get("/users", verifyToken, getAllUsers)
router.post("/sendmoney", verifyToken, initiateTransfer);

router.get("/profile", verifyToken, getUserProfile);
router.put("/update", verifyToken, upload.single("image"), updateUserProfile);
router.get("/profile-image", verifyToken, getUserImage);
router.post("/logout", verifyToken, logoutUser);
router.put('/update-password', verifyToken, updatePassword);
router.post("/verify-password-balance", verifyToken, verifyPasswordAndGetBalance);

// http://localhost:8000/api/profile

export default router;