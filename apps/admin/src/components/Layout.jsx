import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, IndianRupee, LogOut, Menu, 
  Users, FileText, Shield, Briefcase, UserCheck, 
  Package, CreditCard, Activity, Award, Network,
  Settings, Wallet, Box, Plane
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 text-sm font-medium ${
      isActive
        ? 'bg-blue-50/80 text-blue-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const DummyLink = ({ icon: Icon, text }) => (
    <div className="flex items-center space-x-3 px-4 py-2.5 mx-2 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed opacity-70">
      <Icon size={18} strokeWidth={1.5} />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f4f7fb] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 flex-shrink-0">
        <div className="h-16 flex items-center px-6">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-slate-800">SWAPSTORE</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-hide">
          <NavLink to="/dashboard" className={navItemClass}>
            <LayoutDashboard size={18} strokeWidth={1.5} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/rates" className={navItemClass}>
            <IndianRupee size={18} strokeWidth={1.5} />
            <span>Exchange Rates</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10 flex-shrink-0">
          <button className="text-slate-500 hover:text-slate-800 transition-colors">
            <Menu size={22} strokeWidth={1.5} />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-right mr-2 hidden md:block">
              <p className="text-xs font-bold text-slate-800">ADMIN</p>
              <p className="text-[10px] font-bold text-emerald-500 tracking-wide">STATUS: ACTIVE</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
