import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cropper from "react-cropper";

const EditProfile = () => {
  // Add Cropper CSS directly as a string
  const cropperCSS = `
    .cropper-container {
      direction: ltr;
      font-size: 0;
      line-height: 0;
      position: relative;
      -ms-touch-action: none;
      touch-action: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    .cropper-container img {
      display: block;
      height: 100%;
      image-orientation: 0deg;
      max-height: none !important;
      max-width: none !important;
      min-height: 0 !important;
      min-width: 0 !important;
      width: 100%;
    }
    
    .cropper-wrap-box,
    .cropper-canvas,
    .cropper-drag-box,
    .cropper-crop-box,
    .cropper-modal {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }
    
    .cropper-wrap-box,
    .cropper-canvas {
      overflow: hidden;
    }
    
    .cropper-drag-box {
      background-color: #fff;
      opacity: 0;
    }
    
    .cropper-modal {
      background-color: #000;
      opacity: 0.5;
    }
    
    .cropper-view-box {
      display: block;
      height: 100%;
      outline: 1px solid #39f;
      outline-color: rgba(51, 153, 255, 0.75);
      overflow: hidden;
      width: 100%;
    }
    
    .cropper-dashed {
      border: 0 dashed #eee;
      display: block;
      opacity: 0.5;
      position: absolute;
    }
    
    .cropper-dashed.dashed-h {
      border-bottom-width: 1px;
      border-top-width: 1px;
      height: calc(100% / 3);
      left: 0;
      top: calc(100% / 3);
      width: 100%;
    }
    
    .cropper-dashed.dashed-v {
      border-left-width: 1px;
      border-right-width: 1px;
      height: 100%;
      left: calc(100% / 3);
      top: 0;
      width: calc(100% / 3);
    }
    
    .cropper-center {
      display: block;
      height: 0;
      left: 50%;
      opacity: 0.75;
      position: absolute;
      top: 50%;
      width: 0;
    }
    
    .cropper-center:before,
    .cropper-center:after {
      background-color: #eee;
      content: ' ';
      display: block;
      position: absolute;
    }
    
    .cropper-center:before {
      height: 1px;
      left: -3px;
      top: 0;
      width: 7px;
    }
    
    .cropper-center:after {
      height: 7px;
      left: 0;
      top: -3px;
      width: 1px;
    }
    
    .cropper-face,
    .cropper-line,
    .cropper-point {
      display: block;
      height: 100%;
      opacity: 0.1;
      position: absolute;
      width: 100%;
    }
    
    .cropper-face {
      background-color: #fff;
      left: 0;
      top: 0;
    }
    
    .cropper-line {
      background-color: #39f;
    }
    
    .cropper-line.line-e {
      cursor: e-resize;
      right: -3px;
      top: 0;
      width: 5px;
    }
    
    .cropper-line.line-n {
      cursor: n-resize;
      height: 5px;
      left: 0;
      top: -3px;
    }
    
    .cropper-line.line-w {
      cursor: w-resize;
      left: -3px;
      top: 0;
      width: 5px;
    }
    
    .cropper-line.line-s {
      bottom: -3px;
      cursor: s-resize;
      height: 5px;
      left: 0;
    }
    
    .cropper-point {
      background-color: #39f;
      height: 5px;
      opacity: 0.75;
      width: 5px;
    }
    
    .cropper-point.point-e {
      cursor: e-resize;
      margin-top: -3px;
      right: -3px;
      top: 50%;
    }
    
    .cropper-point.point-n {
      cursor: n-resize;
      left: 50%;
      margin-left: -3px;
      top: -3px;
    }
    
    .cropper-point.point-w {
      cursor: w-resize;
      left: -3px;
      margin-top: -3px;
      top: 50%;
    }
    
    .cropper-point.point-s {
      bottom: -3px;
      cursor: s-resize;
      left: 50%;
      margin-left: -3px;
    }
    
    .cropper-point.point-ne {
      cursor: ne-resize;
      right: -3px;
      top: -3px;
    }
    
    .cropper-point.point-nw {
      cursor: nw-resize;
      left: -3px;
      top: -3px;
    }
    
    .cropper-point.point-sw {
      bottom: -3px;
      cursor: sw-resize;
      left: -3px;
    }
    
    .cropper-point.point-se {
      bottom: -3px;
      cursor: se-resize;
      height: 20px;
      right: -3px;
      width: 20px;
    }
    
    @media (min-width: 768px) {
      .cropper-point.point-se {
        height: 15px;
        width: 15px;
      }
    }
    
    @media (min-width: 992px) {
      .cropper-point.point-se {
        height: 10px;
        width: 10px;
      }
    }
    
    @media (min-width: 1200px) {
      .cropper-point.point-se {
        height: 5px;
        opacity: 0.75;
        width: 5px;
      }
    }
    
    .cropper-point.point-se:before {
      background-color: #39f;
      bottom: -50%;
      content: ' ';
      display: block;
      height: 200%;
      opacity: 0;
      position: absolute;
      right: -50%;
      width: 200%;
    }
    
    .cropper-invisible {
      opacity: 0;
    }
    
    .cropper-bg {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
    }
    
    .cropper-hide {
      display: block;
      height: 0;
      position: absolute;
      width: 0;
    }
    
    .cropper-hidden {
      display: none !important;
    }
    
    .cropper-move {
      cursor: move;
    }
    
    .cropper-crop {
      cursor: crosshair;
    }
    
    .cropper-disabled .cropper-drag-box,
    .cropper-disabled .cropper-face,
    .cropper-disabled .cropper-line,
    .cropper-disabled .cropper-point {
      cursor: not-allowed;
    }
  `;

  const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
  const SERVER_BASE = API_BASE.replace("/api", "");
  const token = localStorage.getItem("access_token");

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const cropperRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        if (res.data.success) {
          let userData = res.data.data;
          if (userData.image && !userData.image.startsWith("http")) {
            userData.image = `${SERVER_BASE}${userData.image}`;
          }
          setProfile(userData);
          setImagePreview(userData.image);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageError("");
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.match("image.*")) {
      setImageError("Please select an image file (JPEG, PNG, etc.)");
      toast.error("Invalid file type");
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size should be less than 2MB");
      toast.error("Image too large (max 2MB)");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleCrop = () => {
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.getCroppedCanvas().toBlob((blob) => {
        const fileName = imageFile.name;
        const croppedFile = new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now(),
        });

        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result);
          setProfile(prev => ({ ...prev, image: reader.result }));
          toast.success("Image cropped successfully");
        };
        reader.readAsDataURL(blob);
        
        setImageFile(croppedFile);
        setShowCropper(false);
      }, imageFile.type);
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setImagePreview(profile.image);
    setImageFile(null);
    toast.info("Image cropping cancelled");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      if (imageFile) formData.append("image", imageFile);

      const res = await api.put("/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        let updatedUser = res.data.data;
        if (updatedUser.image && !updatedUser.image.startsWith("http")) {
          updatedUser.image = `${SERVER_BASE}${updatedUser.image}`;
        }
        setProfile(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success("Profile updated successfully!");
        setTimeout(() => navigate("/profile"), 1000);
      } else {
        throw new Error(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-gray-500 text-center">No profile data found.</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      {/* Inject Cropper CSS */}
      <style>{cropperCSS}</style>
      
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold mb-6 text-blue-600">PhonePay</h1>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Adjust Your Profile Picture</h2>
            <div className="mb-4 h-96">
              <Cropper
                src={imagePreview}
                style={{ height: "100%", width: "100%" }}
                initialAspectRatio={1}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                minCropBoxHeight={100}
                minCropBoxWidth={100}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelCrop}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                <FaTimes className="inline mr-1" /> Cancel
              </button>
              <button
                onClick={handleCrop}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                <FaCheck className="inline mr-1" /> Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
          <div className="relative inline-block left-6 top-16">
            <img
              src={imagePreview || "https://via.placeholder.com/150?text=No+Image"}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=No+Image";
              }}
            />
            <label
              htmlFor="imageUpload"
              className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition"
            >
              <FaPencilAlt className="text-white text-sm" />
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between mt-12">
          <div className="space-y-4 w-full md:w-auto">
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <input
                type="text"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-300 focus:border-blue-500 outline-none w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                className="text-gray-500 text-lg border-b border-gray-300 focus:border-blue-500 outline-none w-full"
                required
              />
            </div>
            {imageError && (
              <p className="text-red-500 text-sm mt-2">{imageError}</p>
            )}
          </div>

          {/* Balance */}
          <div className="mt-4 md:mt-0 bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold shadow-md text-lg">
            ₹{" "}
            {Number(profile.balance || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="p-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md disabled:opacity-50 transition-colors duration-200"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;