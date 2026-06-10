import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit2, Check, X, RefreshCw } from 'lucide-react';

const ExchangeRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [newNetwork, setNewNetwork] = useState('DEFAULT');
  const [newRate, setNewRate] = useState('');
  const navigate = useNavigate();

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/v1/rates');
      const ratesObj = response.data;
      const ratesArray = Object.keys(ratesObj).map((key) => {
        let token_symbol = key;
        let network = 'DEFAULT';
        if (key.includes('_')) {
          const parts = key.split('_');
          token_symbol = parts[0];
          network = parts[1];
        }
        return {
          id: key,
          token_symbol,
          network,
          inr_rate: ratesObj[key],
          updated_at: new Date().toISOString(),
        };
      });
      setRates(ratesArray);
    } catch (error) {
      console.error('Failed to fetch rates', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [navigate]);

  const handleEdit = (rate) => {
    setEditingId(rate.id);
    setEditValue(rate.inr_rate);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (rate) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:4000/api/v1/admin/rates',
        {
          tokenSymbol: rate.token_symbol,
          network: rate.network,
          inrRate: parseFloat(editValue),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEditingId(null);
      fetchRates(); // Refresh data
    } catch (error) {
      console.error('Failed to update rate', error);
      alert('Failed to update rate. Please try again.');
    }
  };

  const handleAddNew = async () => {
    if (!newToken || !newRate) {
      alert('Token and Rate are required.');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:4000/api/v1/admin/rates',
        {
          tokenSymbol: newToken.toUpperCase(),
          network: newNetwork.toUpperCase(),
          inrRate: parseFloat(newRate),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsAdding(false);
      setNewToken('');
      setNewNetwork('DEFAULT');
      setNewRate('');
      fetchRates(); // Refresh data
    } catch (error) {
      console.error('Failed to add rate', error);
      alert('Failed to add rate. Please try again.');
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewToken('');
    setNewNetwork('DEFAULT');
    setNewRate('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exchange Rates</h1>
          <p className="mt-1 text-gray-500">Manage your token to INR conversion rates</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Add Rate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Current Rates</h2>
          <button
            onClick={fetchRates}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
            title="Refresh Rates"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Token</th>
                <th className="px-6 py-4">Network</th>
                <th className="px-6 py-4">Rate (INR)</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isAdding && (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="e.g. USDT"
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="e.g. DEFAULT"
                      value={newNetwork}
                      onChange={(e) => setNewNetwork(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        className="w-28 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleAddNew}
                        className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors shadow-sm"
                        title="Save"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors shadow-sm"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {loading && rates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading rates...</td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                          {rate.token_symbol.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{rate.token_symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                        {rate.network}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === rate.id ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 font-medium">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-28 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-lg text-gray-900">₹ {rate.inr_rate}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(rate.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === rate.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleSave(rate)}
                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors shadow-sm"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors shadow-sm"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(rate)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors shadow-sm"
                          title="Edit Rate"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {rates.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No exchange rates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRates;
