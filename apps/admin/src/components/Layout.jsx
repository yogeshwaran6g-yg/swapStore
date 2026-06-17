import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, IndianRupee, LogOut, Menu, ArrowRightLeft, FileCheck, Landmark, Users, Settings, Clock, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { logout, admin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 text-sm font-bold ${isActive
      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
      : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 border border-transparent'
    }`;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-zinc-900/95 border-r border-zinc-800/50 flex flex-col flex-shrink-0 backdrop-blur-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="text-zinc-950 font-black text-lg">S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-zinc-100">SWAPSTORE</span>
          </div>
          <button 
            className="md:hidden text-zinc-500 hover:text-amber-500 transition-colors"
            onClick={closeSidebar}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-2 scrollbar-hide">
          <NavLink to="/dashboard" onClick={closeSidebar} className={navItemClass}>
            <LayoutDashboard size={18} strokeWidth={2} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/rates" onClick={closeSidebar} className={navItemClass}>
            <IndianRupee size={18} strokeWidth={2} />
            <span>Exchange Rates</span>
          </NavLink>
          <NavLink to="/swaps" onClick={closeSidebar} className={navItemClass}>
            <ArrowRightLeft size={18} strokeWidth={2} />
            <span>Swap Orders</span>
          </NavLink>
          <NavLink to="/kyc" onClick={closeSidebar} className={navItemClass}>
            <FileCheck size={18} strokeWidth={2} />
            <span>KYC Management</span>
          </NavLink>
          <NavLink to="/loans" onClick={closeSidebar} className={navItemClass}>
            <Landmark size={18} strokeWidth={2} />
            <span>Loan Management</span>
          </NavLink>
          <NavLink to="/users" onClick={closeSidebar} className={navItemClass}>
            <Users size={18} strokeWidth={2} />
            <span>User Management</span>
          </NavLink>
          <NavLink to="/settings" onClick={closeSidebar} className={navItemClass}>
            <Settings size={18} strokeWidth={2} />
            <span>System Settings</span>
          </NavLink>
          <NavLink to="/cron" onClick={closeSidebar} className={navItemClass}>
            <Clock size={18} strokeWidth={2} />
            <span>Cron Jobs</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-zinc-800/50 shrink-0">
          <div className="bg-zinc-800/30 rounded-xl p-4 flex items-center space-x-3 border border-zinc-800/50">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-zinc-200 truncate">{admin?.username || 'Admin'}</p>
              <p className="text-xs text-amber-500 font-medium tracking-wide">● Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between px-6 z-10 flex-shrink-0 backdrop-blur-md">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-zinc-500 hover:text-amber-500 transition-colors bg-zinc-800/50 p-2 rounded-lg"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
          
          <div className="hidden md:block"></div> {/* Spacer for desktop when menu button is hidden */}

          <div className="flex items-center space-x-4 ml-auto">
            <appkit-button balance="hide" />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
              title="Logout"
            >
              <LogOut size={16} strokeWidth={2.5} />
              <span className="text-sm font-bold hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth relative w-full">
          <div className="absolute top-0 left-0 w-full h-96 bg-amber-500/5 blur-[120px] pointer-events-none"></div>
          <div className="relative z-10 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
