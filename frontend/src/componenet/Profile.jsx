import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
  const SERVER_URL = BASE_URL.replace("/api", "");
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password modal for changing password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Balance reveal modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balancePassword, setBalancePassword] = useState("");
  const [showActualBalance, setShowActualBalance] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => {
        if (res.data.success) {
          setProfile(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/150?text=No+Image";
    }
    if (imagePath.startsWith("http")) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  const handleLogout = () => {
    api
      .post("/logout")
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          localStorage.removeItem("access_token");
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }
      })
      .catch(() => {
        toast.error("Logout failed");
      });
  };

  const handlePasswordChange = () => {
    setErrors({});
    api
      .put("/update-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Password updated successfully");
          setShowPasswordModal(false);
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      })
      .catch((err) => {
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        } else {
          toast.error("Failed to update password");
        }
      });
  };

  const handleVerifyBalance = () => {
    setBalanceLoading(true);
    api
      .post("/verify-password-balance", { password: balancePassword })
      .then((res) => {
        if (res.data.success) {
          setProfile((prev) => ({
            ...prev,
            balance: res.data.balance,
          }));
          setShowActualBalance(true);
          toast.success("Password verified successfully");
          setShowBalanceModal(false);
          setBalancePassword("");
        }
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Password verification failed"
        );
      })
      .finally(() => setBalanceLoading(false));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <ToastContainer />
      <div>
        <h1 className="text-3xl font-bold mb-6 text-blue-600">PhonePay</h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : profile ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
              <img
                src={getImageUrl(profile.image)}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg absolute left-6 -bottom-14 object-cover"
              />
            </div>

            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between mt-12">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {profile.name}
                </h2>
                <p className="text-gray-500 text-lg">{profile.phone}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold shadow-md text-lg">
                  ₹{" "}
                  {showActualBalance
                    ? Number(profile.balance || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })
                    : "****"}
                </div>
                {!showActualBalance && (
                  <button
                    onClick={() => setShowBalanceModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold text-white px-3 py-2 rounded-lg text-sm shadow"
                  >
                    Show Balance
                  </button>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 px-6 py-4 border-t">
              <button
                onClick={() => navigate("/editprofile")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Logout
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t text-center text-gray-600 flex flex-col items-center gap-2">
              <p>
                Made by <span className="font-semibold">Krishna</span> ©{" "}
                {new Date().getFullYear()}
              </p>
              <div className="flex gap-4 text-2xl">
                <a
                  href="https://www.instagram.com/_krishnav_v/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-500"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.linkedin.com/in/krishna-vishwakarma-485267291/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-700"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No profile data found.</p>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Change Password
              </h2>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  // Sirf digits aur max 4 digits
                  if (/^\d{0,4}$/.test(value)) {
                    setOldPassword(value);
                  }
                }}
                maxLength={4} // Extra safeguard
                className={`w-full border p-2 rounded mb-1 ${
                  errors.oldPassword ? "border-red-500" : "border-gray-300"
                }`}
              />

              {errors.oldPassword && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.oldPassword}
                </p>
              )}
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  // Sirf 0–9 digits aur max 4 digits
                  if (/^\d{0,4}$/.test(value)) {
                    setNewPassword(value);
                  }
                }}
                maxLength={4} // Extra safety
                className={`w-full border p-2 rounded mb-1 ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />

              {errors.newPassword && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.newPassword}
                </p>
              )}

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  // Sirf 0–9 digits aur max 4 digits
                  if (/^\d{0,4}$/.test(value)) {
                    setConfirmPassword(value);
                  }
                }}
                maxLength={4} // extra safety
                className={`w-full border p-2 rounded mb-1 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.confirmPassword}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Balance Verify Modal */}
        {showBalanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Enter your 4 dight Number
              </h2>

              <input
                type="password"
                placeholder="Password"
                value={balancePassword}
                onChange={(e) => {
                  const value = e.target.value;
                  // Sirf 0–9 digits aur max 4 digit
                  if (/^\d{0,4}$/.test(value)) {
                    setBalancePassword(value);
                  }
                }}
                maxLength={4} // extra safety
                className="w-full border p-2 rounded mb-1 border-gray-300"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyBalance}
                  disabled={balanceLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {balanceLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
