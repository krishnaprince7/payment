import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

  const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/register", formData);
      toast.success("Registration successful!");
      console.log("Register success:", res.data);
      setFormData({ name: "", phone: "", password: "" });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
      toast.error("Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
           <input
  type="text"
  name="name"
  value={formData.name}
  onChange={(e) => {
    const value = e.target.value;
    // Sirf alphabets aur spaces allow
    if (/^[A-Za-z\s]*$/.test(value)) {
      handleChange(e);
    }
  }}
  placeholder="Enter your full name"
  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    errors.name ? "border-red-500" : "border-gray-300"
  }`}
/>

            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
  type="text"
  name="phone"
  value={formData.phone}
  onChange={(e) => {
    const value = e.target.value;
    // Sirf numbers allow
    if (/^[0-9]*$/.test(value)) {
      handleChange(e);
    }
  }}
  placeholder="Enter your phone No"
  maxLength={10} // optional: limit to 10 digits
  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    errors.phone ? "border-red-500" : "border-gray-300"
  }`}
/>

            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
           <input
  type="password"
  name="password"
  value={formData.password}
  onChange={(e) => {
    const value = e.target.value;
    // Sirf numbers aur max 4 digit
    if (/^[0-9]{0,4}$/.test(value)) {
      handleChange(e);
    }
  }}
  placeholder="Enter 4 digit password"
  maxLength={4}
  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    errors.password ? "border-red-500" : "border-gray-300"
  }`}
/>

            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* General backend error */}
        {errors.general && (
          <div className="mt-4 p-3 border border-red-400 bg-red-50 text-red-700 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        {/* Redirect to Login */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          

          <Link className="text-blue-600 hover:underline" to="/login">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
