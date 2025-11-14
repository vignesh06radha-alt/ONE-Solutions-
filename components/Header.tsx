import React, { useContext } from 'react';
import { AppContext, IAppContext } from '../contexts/AppContext';
import { LogOut } from 'lucide-react';
import Logo from './Logo';

const Header: React.FC = () => {
  const { user, logout } = useContext(AppContext) as IAppContext;

  return (
    <header className="flex items-center justify-between p-4 bg-[#111111] border-b border-gray-800 shadow-sm">
      <div className="flex items-center gap-3">
        <Logo userRole={user?.role || null} className="h-8 w-8" />
        <span className="text-2xl font-semibold whitespace-nowrap text-white">ONE</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
            <img src={user?.avatar} alt="User Avatar" className="h-8 w-8 rounded-full border-2 border-gray-600" />
            <span className="font-medium hidden md:block text-gray-200">{user?.name}</span>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-900/20 rounded-md hover:bg-red-900/50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
