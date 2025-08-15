import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { MdNotificationsActive, MdAttachMoney } from "react-icons/md";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  withCredentials: true,
});

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${BASE_URL.replace("/api", "")}${imagePath}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/users");
        if (res.data.success) {
          setCurrentUser(res.data.currentUser);
          const otherUsers = res.data.users.filter(
            (u) => u._id !== res.data.currentUser._id
          );
          setUsers(otherUsers);
          setFilteredUsers(otherUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const validateAmount = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount (> ₹0)");
      return;
    }

    try {
      const res = await api.post("/sendmoney", { amount: Number(amount) });

      if (res.data.success) {
        setError("");
        setShowAmountModal(false);
        setShowPasswordModal(true);
      } else {
        setError(res.data.error || "Validation failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error validating amount");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setPassword(value);
    }
  };

  const confirmTransaction = async () => {
    if (password.length !== 4) {
      setError("Enter 4-digit UPI PIN");
      return;
    }

    try {
      const res = await api.post("/password", {
        amount: Number(amount),
        recipientId: selectedUser,
        password,
      });

      if (res.data.success) {
        toast.success(`Success! ₹${amount} sent to ${res.data.data.recipient}`);
        setCurrentUser((prev) => ({
          ...prev,
          balance: res.data.data.newBalance,
        }));
        setAmount("");
        setPassword("");
        setSelectedUser(null);
        setShowPasswordModal(false);
      } else {
        setError(res.data.error || "Transaction failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error completing transaction");
    }
  };

  const openSendMoneyModal = (userId) => {
    setSelectedUser(userId);
    setShowAmountModal(true);
    setError("");
  };

  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold mb-6 text-blue-600">PhonePay</h1>

      {currentUser && (
        <div className="mb-6 border p-4 rounded-lg flex justify-between bg-white shadow-md">
          <div className="flex items-center">
            {currentUser.image ? (
              <img
                src={getImageUrl(currentUser.image)}
                alt={currentUser.name}
                className="h-12 w-12 rounded-full object-cover mr-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  e.target.className = 'bg-blue-500 text-white rounded-full h-12 w-12 flex items-center justify-center mr-4';
                  e.target.textContent = currentUser.name.charAt(0).toUpperCase();
                }}
              />
            ) : (
              <div className="bg-blue-500 text-white rounded-full h-12 w-12 flex items-center justify-center mr-4">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Welcome, {currentUser.name}
              </h2>
              <p className="text-lg font-medium">
                <span className="text-gray-600">Balance:</span> ₹****
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-3">Send Money</h2>

        {filteredUsers.length > 0 ? (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((u) => (
              <li
                key={u._id}
                className="border p-3 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  {u.image ? (
                    <img
                      src={getImageUrl(u.image)}
                      alt={u.name}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.className = 'bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3';
                        e.target.textContent = u.name.charAt(0).toUpperCase();
                      }}
                    />
                  ) : (
                    <div className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => openSendMoneyModal(u._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Pay
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-4 text-gray-500">No contacts found</p>
        )}
      </div>

      {/* Amount Modal */}
      {showAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">Send Money</h3>
              <button
                onClick={() => {
                  setShowAmountModal(false);
                  setAmount("");
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-1">To</p>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                {users.find((u) => u._id === selectedUser)?.image ? (
                  <img
                    src={getImageUrl(users.find((u) => u._id === selectedUser)?.image)}
                    alt={users.find((u) => u._id === selectedUser)?.name}
                    className="h-10 w-10 rounded-full object-cover mr-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.className = 'bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3';
                      e.target.textContent = users.find((u) => u._id === selectedUser)?.name.charAt(0).toUpperCase();
                    }}
                  />
                ) : (
                  <div className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
                    {users
                      .find((u) => u._id === selectedUser)
                      ?.name.charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {users.find((u) => u._id === selectedUser)?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="amount" className="block text-gray-600 mb-1">
                Amount (₹)
              </label>
              <input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={validateAmount}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">Enter UPI PIN</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600">Sending payment to</p>
              <p className="text-xl font-medium">
                {users.find((u) => u._id === selectedUser)?.name}
              </p>
              <p className="text-2xl font-bold mt-2">₹{amount}</p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-600 mb-1 text-center"
              >
                Enter 4-digit UPI PIN
              </label>
              <div className="flex justify-center">
                <input
                  id="password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-48 text-center p-3 border rounded-lg text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              onClick={confirmTransaction}
              disabled={password.length !== 4}
              className={`w-full py-3 rounded-lg text-lg font-medium transition-colors ${
                password.length === 4
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;