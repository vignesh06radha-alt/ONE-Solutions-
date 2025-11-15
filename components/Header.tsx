import React, { useContext } from 'react';
import { AppContext, IAppContext } from '../contexts/AppContext';
import { LogOut } from 'lucide-react';
import Logo from './Logo';

const Header: React.FC = () => {
  const { user, logout } = useContext(AppContext) as IAppContext;

  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-lg relative z-20 animate-slideDown">
      <div className="flex items-center gap-3 animate-slideRight">
        <div className="relative">
          <Logo userRole={user?.role || null} className="h-10 w-10 transform hover:scale-110 hover:rotate-12 transition-all duration-300" />
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-0 hover:opacity-100 transition-opacity"></div>
        </div>
        <span className="text-3xl font-bold whitespace-nowrap bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
          ONE
        </span>
      </div>
      <div className="flex items-center space-x-4 animate-slideLeft">
        <div className="flex items-center space-x-3 bg-gray-800/50 rounded-full px-4 py-2 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
            <img src={user?.avatar} alt="User Avatar" className="h-9 w-9 rounded-full border-2 border-green-500/30 shadow-lg" />
            <span className="font-semibold hidden md:block text-gray-200">{user?.name}</span>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-red-400 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-lg hover:from-red-900/50 hover:to-red-800/40 transition-all duration-300 border border-red-500/30 hover:border-red-400/50 transform hover:scale-105"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
