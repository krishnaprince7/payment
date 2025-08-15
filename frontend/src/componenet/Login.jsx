import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

// Create axios instance with token if it exists
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Login = () => {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/login", formData);

      if (res.data.success && res.data.data?.accessToken) {
        // Store token
        localStorage.setItem("access_token", res.data.data.accessToken);

        // Update axios headers
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.data.accessToken}`;

        // Optional: parse token payload if needed
        try {
          const tokenPayload = JSON.parse(
            atob(res.data.data.accessToken.split(".")[1])
          );
          // Use tokenPayload if required
        } catch (parseErr) {
          // ignore parse errors
        }

        toast.success(res.data.message || "Login successful!");
        setFormData({ phone: "", password: "" });

        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
      toast.error(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                // Sirf digits aur max 10 digit
                if (/^\d{0,10}$/.test(value)) {
                  handleChange(e);
                }
              }}
              placeholder="Enter your phone No"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />

            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => {
                const value = e.target.value;
                // Sirf 0-9 digits aur max 4 digit allow karega
                if (/^\d{0,4}$/.test(value)) {
                  handleChange(e);
                }
              }}
              placeholder="Enter 4 digit password"
              maxLength={4} // Safety ke liye
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* General backend error */}
        {errors.general && (
          <div className="mt-4 p-3 border border-red-400 bg-red-50 text-red-700 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        {/* Redirect to Register */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
