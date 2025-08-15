import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillHome } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { MdOutlineHistory } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [receivedCount, setReceivedCount] = useState(0);
  const [lastSeenCount, setLastSeenCount] = useState(0);

  // Initialize last seen count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem("lastSeenCount");
    if (savedCount) {
      setLastSeenCount(parseInt(savedCount, 10));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileImage = async () => {
      try {
        const res = await api.get("/profile-image");
        if (res.data.success && res.data.data.image && isMounted) {
          const imageUrl = res.data.data.image.startsWith("http")
            ? res.data.data.image
            : `${BASE_URL.replace("/api", "")}${res.data.data.image}`;
          setProfileImage(imageUrl);
        }
      } catch (err) {
        console.error("Error fetching profile image:", err);
      }
    };

    const fetchReceivedCount = async () => {
      try {
        const res = await api.get("/count"); // updated API
        if (res.data.success && isMounted) {
          setReceivedCount(res.data.received || 0);

          // Save the current received count when visiting notifications
          if (location.pathname === "/notification") {
            localStorage.setItem("lastSeenCount", res.data.received.toString());
            setLastSeenCount(res.data.received);
          }
        }
      } catch (err) {
        console.error("Error fetching received count:", err);
      }
    };

    fetchProfileImage();
    fetchReceivedCount();

    const interval = setInterval(() => {
      fetchProfileImage();
      fetchReceivedCount();
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Calculate unseen notifications
  const unseenCount = Math.max(0, receivedCount - lastSeenCount);

  const icons = [
    { path: "/home", icon: <AiFillHome />, label: "Home" },
    { path: "/search", icon: <FiSearch />, label: "Search" },
    { 
      path: "/notification", 
      icon: (
        <div className="relative">
          <MdOutlineHistory />
          {unseenCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unseenCount}
            </span>
          )}
        </div>
      ), 
      label: "History",
    },
    {
      path: "/profile",
      icon: profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
          P
        </div>
      ),
      label: "Profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-gray-50 to-white shadow-lg flex justify-around items-center py-2 border-t border-gray-200 z-50">
      {icons.map(({ path, icon, label }) => (
        <Link
          key={path}
          to={path}
          className={`flex flex-col items-center text-sm transition-all duration-300 relative ${
            location.pathname === path
              ? "text-blue-500 scale-110"
              : "text-gray-500 hover:text-blue-500 hover:scale-105"
          }`}
          onClick={() => {
            if (path === "/notification") {
              localStorage.setItem("lastSeenCount", receivedCount.toString());
              setLastSeenCount(receivedCount);
            }
          }}
        >
          <span className="text-2xl">
            {icon}
          </span>
          <span className="mt-1 text-xs">{label}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navbar;
