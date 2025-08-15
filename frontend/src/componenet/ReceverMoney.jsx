import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { HiArrowDownCircle, HiArrowUpCircle } from 'react-icons/hi2';

const ReceverMoney = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
  const token = localStorage.getItem("access_token");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions/history');
        if (response.data.success) {
          // Combine and sort transactions by date (newest first)
          const combined = [
            ...(response.data.sent?.transactions || []).map(tx => ({ ...tx, type: 'sent' })),
            ...(response.data.received?.transactions || []).map(tx => ({ ...tx, type: 'received' }))
          ].sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setTransactions(combined);
        } else {
          setError(response.data.error || 'Failed to fetch transactions');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-red-500 text-center py-8">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <h1 className="text-3xl font-bold text-blue-600">Transaction History</h1>
        <span className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {transactions.length} total
        </span>
      </div>

      {/* List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div 
                key={tx.id}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${
                      tx.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'received' ? (
                        <HiArrowDownCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <HiArrowUpCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {tx.type === 'received' 
                          ? `Received from ${tx.sender}`
                          : `Sent to ${tx.receiver}`}
                      </h3>
                      <p className="text-gray-500 text-sm">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'received' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.type === 'received' ? '+' : '-'} ₹{tx.amount}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Balance: ₹{tx.balanceAfter}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceverMoney;