import React, { useState } from 'react';
import { useLoan } from '../../hooks/useLoan';

export const LoanDashboard = () => {
  const { loans, loading, error, uploadKyc, requestLoan, getMyLoans } = useLoan();
  const [kycFile, setKycFile] = useState(null);
  const [docType, setDocType] = useState('passport');

  const [principal, setPrincipal] = useState('');
  const [tokenAddr, setTokenAddr] = useState('');
  const [network, setNetwork] = useState('bsc');

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kycFile) return alert('Please select a file');
    const formData = new FormData();
    formData.append('kycDocument', kycFile);
    formData.append('documentType', docType);
    await uploadKyc(formData);
    alert('KYC uploaded successfully! Awaiting approval.');
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    if (!principal || !tokenAddr) return alert('Please fill all fields');
    const res = await requestLoan({
      principalAmount: Number(principal),
      tokenAddress: tokenAddr,
      network
    });
    if (res?.success) {
      alert('Loan requested successfully!');
      setPrincipal('');
      setTokenAddr('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-32 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Loan Dashboard</h1>
            <p className="mt-2 text-gray-400 text-lg">Manage your KYC, request loans, and track your active positions.</p>
          </div>
          <button
            onClick={getMyLoans}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-[#13131f] hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-[#0a0a0f] transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-900/20 p-4 border border-red-900/50 shadow-sm animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">Error encountered</h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* KYC Form Card */}
          <div className="bg-[#13131f] rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-700">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Upload KYC</h2>
              </div>
              <p className="text-gray-400 mb-8">Please provide a valid document to verify your identity before requesting a loan.</p>

              <form onSubmit={handleKycSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-700 bg-[#0a0a0f] text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm rounded-xl transition-colors"
                  >
                    <option value="passport">Passport</option>
                    <option value="id_card">National ID</option>
                    <option value="driver_license">Driver's License</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Upload Document</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-xl hover:border-purple-500 hover:bg-[#1a1a2e] transition-colors bg-[#0a0a0f] cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-400 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 focus-within:ring-offset-[#0a0a0f]">
                          <span>{kycFile ? kycFile.name : 'Upload a file'}</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setKycFile(e.target.files[0])} />
                        </label>
                        {!kycFile && <p className="pl-1">or drag and drop</p>}
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Processing...' : 'Submit KYC'}
                </button>
              </form>
            </div>
          </div>

          {/* Request Loan Card */}
          <div className="bg-[#13131f] rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-700">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Request Loan</h2>
              </div>
              <p className="text-gray-400 mb-8">Enter the desired loan amount and collateral details below.</p>

              <form onSubmit={handleLoanSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Principal Amount (USD)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="block w-full pl-7 pr-12 py-3 border border-gray-700 bg-[#0a0a0f] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Token Contract Address</label>
                  <input
                    type="text"
                    value={tokenAddr}
                    onChange={(e) => setTokenAddr(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-700 bg-[#0a0a0f] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors font-mono"
                    placeholder="0x..."
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Network</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-700 bg-[#0a0a0f] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors"
                  >
                    <option value="bsc">Binance Smart Chain (BSC)</option>
                    <option value="polygon">Polygon</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Processing...' : 'Request Loan'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* My Loans Section */}
        <div className="bg-[#13131f] rounded-2xl border border-gray-800 overflow-hidden mt-12">
          <div className="px-8 py-6 border-b border-gray-800 bg-[#13131f] flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Your Loan History</h2>
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 relative">
                {loading ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                )}
              </span>
              <span className="text-sm text-gray-400">{loading ? 'Syncing...' : 'Live'}</span>
            </div>
          </div>

          <div className="p-0">
            {loans && loans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-[#0a0a0f]/50">
                    <tr>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Loan ID</th>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Interest Rate</th>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {loans.map((loan) => (
                      <tr key={loan.loan_id} className="hover:bg-[#1a1a2e] transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-mono text-gray-300 font-medium">
                          {loan.loan_id.substring(0, 8)}...
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white">
                          ${Number(loan.principal_amount).toLocaleString()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-300">
                          {loan.interest_rate}%
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${loan.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              loan.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400">
                          {new Date(loan.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-white">No loans found</h3>
                <p className="mt-1 text-gray-400 text-sm">Get started by requesting a loan above.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
