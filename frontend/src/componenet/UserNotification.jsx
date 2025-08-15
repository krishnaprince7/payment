import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdArrowBack, MdPayment, MdAttachMoney, MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const UserNotification = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
  const token = localStorage.getItem("access_token");
  const [transactions, setTransactions] = useState({
    sent: [],
    received: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sent', 'received'
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
        const response = await api.get('/transactions');
        if (response.data.success) {
          setTransactions({
            sent: response.data.sent?.transactions || [],
            received: response.data.received?.transactions || []
          });
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

  const filteredTransactions = () => {
    switch (activeTab) {
      case 'sent':
        return transactions.sent;
      case 'received':
        return transactions.received;
      default:
        return [...transactions.sent, ...transactions.received]
          .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
            Transaction History
          </h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {/* <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {transactions.sent.length} Sent
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            {transactions.received.length} Received
          </span> */}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All Transactions
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'sent' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'received' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('received')}
        >
          Received
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredTransactions().length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredTransactions().map((tx) => {
              const isReceived = 'sender' in tx;
              const type = isReceived ? 'received' : 'sent';
              
              return (
                <li
                  key={tx.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTx({ ...tx, type })}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <div className={`p-2 rounded-full mr-3 ${type === 'received' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {type === 'received' ? (
                            <MdAttachMoney className="text-xl" />
                          ) : (
                            <MdPayment className="text-xl" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {type === 'received'
                              ? `From: ${tx.sender}`
                              : `To: ${tx.recipient}`}
                          </p>
                          {/* <p className="text-sm text-gray-500">
                            {formatDate(tx.date)}
                          </p> */}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                        <p className={`text-sm font-semibold ${type === 'received' ? 'text-green-600' : 'text-red-600'}`}>
                          {type === 'received' ? '+' : '-'}₹{tx.amount}
                        </p>
                        {/* <p className="text-xs text-gray-500">
                          Bal: ₹{tx.balanceAfter}
                        </p> */}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? 'No transactions found' 
                : `No ${activeTab} transactions found`}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setSelectedTx(null)}
            >
              <MdClose className="text-xl" />
            </button>
            
            <div className="p-6">
              {/* Transaction Header */}
              <div className="flex items-start mb-6">
                <div className={`p-3 rounded-xl mr-4 ${selectedTx.type === 'received' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {selectedTx.type === 'received' ? (
                    <MdAttachMoney className="text-2xl" />
                  ) : (
                    <MdPayment className="text-2xl" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedTx.type === 'received'
                      ? `Received from ${selectedTx.sender}`
                      : `Sent to ${selectedTx.recipient}`}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatDate(selectedTx.date)}
                  </p>
                </div>
              </div>
              
              {/* Transaction Details */}
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${selectedTx.type === 'received' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className={`text-2xl font-bold ${selectedTx.type === 'received' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTx.type === 'received' ? '+' : '-'}₹{selectedTx.amount}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-medium text-gray-900">{selectedTx.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance After</p>
                    <p className="font-medium text-gray-900">₹{selectedTx.balanceAfter}</p>
                  </div>
                </div>
                
                {selectedTx.note && (
                  <div>
                    <p className="text-sm text-gray-500">Note</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700">
                      {selectedTx.note}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNotification;