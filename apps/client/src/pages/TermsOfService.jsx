import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
        <h1 className="text-4xl lg:text-5xl font-[800] text-[#0E1B4D] mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-[#64748B] font-medium mb-12">Last Updated: June 2026</p>

        <div className="prose prose-slate max-w-none text-[#475569] leading-relaxed">
          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing or using InstaaCash, you agree to be bound by these Terms of Service.</p>
          <p className="mb-6">If you do not agree with any portion of these terms, you must discontinue use of the platform.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">2. Eligibility</h2>
          <p className="mb-2">To use InstaaCash, you must:</p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Be at least 18 years old</li>
            <li>Have legal capacity to enter contracts</li>
            <li>Comply with applicable laws in your jurisdiction</li>
            <li>Successfully complete KYC verification when required</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">3. Services Provided</h2>
          <p className="mb-2">InstaaCash provides:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Cryptocurrency Swap Services</li>
            <li>Crypto-backed Loan Services</li>
            <li>Wallet Integration Services</li>
            <li>Digital Asset Management Features</li>
            <li>Related Financial Technology Services</li>
          </ul>
          <p className="mb-6">InstaaCash does not provide investment, legal, or financial advice.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">4. Account Responsibilities</h2>
          <p className="mb-2">Users are responsible for:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Maintaining wallet security</li>
            <li>Protecting private keys and recovery phrases</li>
            <li>Providing accurate information</li>
            <li>Keeping account credentials confidential</li>
          </ul>
          <p className="mb-6">InstaaCash is not responsible for losses resulting from compromised wallets or user negligence.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">5. Crypto Swaps</h2>
          <p className="mb-2">Users acknowledge that:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Market prices fluctuate continuously</li>
            <li>Swap rates may change before execution</li>
            <li>Network congestion may impact processing times</li>
            <li>Blockchain confirmations are required</li>
          </ul>
          <p className="mb-6">Completed swaps cannot be reversed once executed on the blockchain.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">6. Crypto Loans</h2>
          <p className="mb-4">Loan services may require collateral.</p>
          <p className="mb-2">Users understand that:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Loan approval is subject to platform requirements</li>
            <li>Collateral value may fluctuate</li>
            <li>Liquidation may occur if collateral falls below required thresholds</li>
            <li>Loan terms may vary depending on market conditions</li>
          </ul>
          <p className="mb-6">Users remain responsible for repayment obligations.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">7. Fees</h2>
          <p className="mb-2">InstaaCash may charge:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Swap Fees</li>
            <li>Loan Processing Fees</li>
            <li>Network Fees</li>
            <li>Service Fees</li>
          </ul>
          <p className="mb-6">Applicable fees will be displayed before transaction confirmation whenever possible.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">8. Prohibited Activities</h2>
          <p className="mb-2">Users may not:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Engage in fraud</li>
            <li>Use stolen funds</li>
            <li>Conduct money laundering activities</li>
            <li>Violate sanctions regulations</li>
            <li>Exploit platform vulnerabilities</li>
            <li>Interfere with platform operations</li>
            <li>Provide false KYC information</li>
          </ul>
          <p className="mb-6">Violations may result in account suspension or termination.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">9. Compliance Requirements</h2>
          <p className="mb-2">InstaaCash reserves the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Request additional verification</li>
            <li>Suspend transactions</li>
            <li>Freeze accounts for investigations</li>
            <li>Report suspicious activities to authorities</li>
          </ul>
          <p className="mb-6">When required by law or regulatory obligations.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="mb-4">To the fullest extent permitted by law:</p>
          <p className="mb-2">InstaaCash shall not be liable for:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Cryptocurrency price volatility</li>
            <li>Market losses</li>
            <li>Blockchain network failures</li>
            <li>Third-party wallet issues</li>
            <li>User errors</li>
            <li>Force majeure events</li>
          </ul>
          <p className="mb-6">Users assume full responsibility for their digital asset decisions.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">11. No Financial Advice</h2>
          <p className="mb-4">Information provided on InstaaCash is for informational purposes only.</p>
          <p className="mb-2">Nothing on the platform constitutes:</p>
          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Investment advice</li>
            <li>Financial advice</li>
            <li>Tax advice</li>
            <li>Legal advice</li>
          </ul>
          <p className="mb-6">Users should seek professional guidance when necessary.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">12. Intellectual Property</h2>
          <p className="mb-4">All content, trademarks, branding, designs, logos, and software associated with InstaaCash remain the property of InstaaCash and its licensors.</p>
          <p className="mb-6">Unauthorized use is prohibited.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">13. Suspension and Termination</h2>
          <p className="mb-2">We reserve the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Restrict access</li>
            <li>Suspend accounts</li>
            <li>Terminate services</li>
          </ul>
          <p className="mb-6">For violations of these Terms, legal requirements, or security concerns.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">14. Amendments</h2>
          <p className="mb-4">InstaaCash may modify these Terms at any time.</p>
          <p className="mb-6">Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">15. Governing Law</h2>
          <p className="mb-6">These Terms shall be governed by applicable laws and regulations of the jurisdiction in which InstaaCash operates.</p>

          <h2 className="text-2xl font-bold text-[#0E1B4D] mt-8 mb-4">16. Contact Information</h2>
          <p className="mb-4">For questions regarding these Terms:</p>
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

export default TermsOfService;
