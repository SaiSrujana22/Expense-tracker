import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, PieChart, LogOut, Wallet } from 'lucide-react';
import clsx from 'clsx';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
    { path: '/budgets', label: 'Budgets', icon: PieChart },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-card m-4 hidden md:flex flex-col border border-slate-800">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-slate-800 border border-slate-700 p-2 rounded-xl shadow-lg shadow-black/50">
            <Wallet className="w-6 h-6 text-slate-300" />
          </div>
          <h1 className="text-xl font-bold text-white font-serif tracking-wide leading-tight">
            Expense<br/>Tracker
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 uppercase tracking-wider text-xs font-bold',
                  isActive 
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-md shadow-black/20' 
                    : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300 border border-transparent'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 font-bold font-serif">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-slate-400 font-serif">{user?.username}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
