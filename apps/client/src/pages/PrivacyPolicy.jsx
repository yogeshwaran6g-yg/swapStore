import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C7D0E6] to-[#DDE3F0] py-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#A99CFF]/30">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl shadow-sm rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/60">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-[#6366F1] hover:text-[#4338CA] font-semibold text-[15px] mb-8 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
        <h1 className="text-4xl lg:text-5xl font-[800] text-[#0E1B4D] mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-[#64748B] font-medium mb-12">Last Updated: June 2026</p>

        <div className="prose prose-slate max-w-none text-[#475569] leading-relaxed">
          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">Welcome to InstaaCash. We are committed to protecting your privacy and ensuring that your personal information is handled securely and responsibly.</p>
          <p className="mb-4">This Privacy Policy explains how InstaaCash collects, uses, stores, and protects your information when you access our website, mobile applications, crypto swap services, and crypto-backed loan services.</p>
          <p className="mb-6">By using InstaaCash, you agree to the practices described in this Privacy Policy.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold text-[#0E1B4D] mt-6 mb-3">Personal Information</h3>
          <p className="mb-2">We may collect:</p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Wallet Address</li>
            <li>Government-issued Identification Documents</li>
            <li>KYC Verification Information</li>
            <li>Selfie and Liveness Verification Data</li>
            <li>Customer Support Communications</li>
            <li>Transaction Information</li>
          </ul>

          <p className="mb-2">We collect information related to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Crypto deposits and withdrawals</li>
            <li>Swap transactions</li>
            <li>Loan applications</li>
            <li>Loan repayments</li>
            <li>Blockchain transaction records</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#0E1B4D] mt-6 mb-3">Technical Information</h3>
          <p className="mb-2">We may automatically collect:</p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>IP Address</li>
            <li>Device Information</li>
            <li>Browser Information</li>
            <li>Operating System</li>
            <li>Website Usage Analytics</li>
            <li>Cookies and Tracking Technologies</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Create and manage your account</li>
            <li>Verify your identity</li>
            <li>Process crypto swaps</li>
            <li>Process loan applications</li>
            <li>Prevent fraud and unauthorized activities</li>
            <li>Comply with legal and regulatory obligations</li>
            <li>Improve our services</li>
            <li>Provide customer support</li>
            <li>Send important service notifications</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">4. KYC & Identity Verification</h2>
          <p className="mb-4">To comply with applicable laws and maintain platform security, users may be required to complete identity verification.</p>
          <p className="mb-2">This may include:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>National ID or Passport</li>
            <li>Selfie Verification</li>
            <li>Facial Recognition Checks</li>
            <li>Liveness Verification</li>
            <li>Address Verification</li>
          </ul>
          <p className="mb-6">Failure to provide required information may result in limited access to services.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">5. Cookies</h2>
          <p className="mb-2">InstaaCash uses cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Improve website performance</li>
            <li>Remember user preferences</li>
            <li>Analyze platform usage</li>
            <li>Enhance security</li>
          </ul>
          <p className="mb-6">You may disable cookies through your browser settings, although some features may not function properly.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">6. Data Security</h2>
          <p className="mb-2">We implement industry-standard security measures including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>SSL Encryption</li>
            <li>Secure Wallet Integrations</li>
            <li>Access Controls</li>
            <li>Fraud Detection Systems</li>
            <li>Encrypted Storage</li>
          </ul>
          <p className="mb-6">While we strive to protect your information, no method of transmission or storage is 100% secure.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">7. Sharing of Information</h2>
          <p className="mb-4">We do not sell your personal information.</p>
          <p className="mb-2">We may share information with:</p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Identity Verification Providers</li>
            <li>Payment Processors</li>
            <li>Blockchain Infrastructure Providers</li>
            <li>Legal Authorities when required by law</li>
            <li>Fraud Prevention Services</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">8. Blockchain Transactions</h2>
          <p className="mb-4">Blockchain transactions are public and permanently recorded on their respective networks.</p>
          <p className="mb-4">InstaaCash cannot modify, delete, or reverse blockchain records once confirmed.</p>
          <p className="mb-6">Users are responsible for ensuring wallet addresses and transaction details are accurate.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">9. Data Retention</h2>
          <p className="mb-2">We retain information as long as necessary to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Provide services</li>
            <li>Meet legal obligations</li>
            <li>Resolve disputes</li>
            <li>Prevent fraud</li>
          </ul>
          <p className="mb-6">Some records may be retained longer when required by applicable laws.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">10. Your Rights</h2>
          <p className="mb-2">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Access your personal information</li>
            <li>Request corrections</li>
            <li>Request deletion where legally permitted</li>
            <li>Withdraw consent</li>
            <li>Request data portability</li>
          </ul>
          <p className="mb-6">Requests may be submitted through our support team.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">11. Third-Party Services</h2>
          <p className="mb-4">Our platform may contain links to third-party websites and wallet providers.</p>
          <p className="mb-6">We are not responsible for the privacy practices of external services.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">12. Changes to This Policy</h2>
          <p className="mb-4">We may update this Privacy Policy periodically.</p>
          <p className="mb-6">Changes become effective immediately upon publication on our website.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">13. Contact Us</h2>
          <p className="mb-4">If you have questions regarding this Privacy Policy, contact:</p>
          <div className="bg-[#F1F5F9] p-5 rounded-2xl inline-block border border-gray-200 shadow-sm">
            <p className="font-bold text-[#0E1B4D] mb-1">InstaaCash Support</p>
            <span 
              className="text-[#6366F1] cursor-pointer hover:text-[#4338CA] transition-colors font-medium hover:underline"
              onClick={(e) => {
                navigator.clipboard.writeText('support@instaacash.com');
                const originalText = e.target.innerText;
                e.target.innerText = 'Email Copied!';
                setTimeout(() => e.target.innerText = originalText, 2000);
              }}
              title="Click to copy email address"
            >
              support@instaacash.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
