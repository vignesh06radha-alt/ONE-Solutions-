import React, { useContext } from 'react';
import { AppContext, IAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { LayoutDashboard, Flag, Handshake, Building, Map, Bot, BarChart, Settings, Gift } from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.ElementType;
  roles: UserRole[];
  path: string;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.Citizen, UserRole.Company, UserRole.Contractor, UserRole.Admin], path: 'dashboard' },
    { name: 'Report to AI Agent', icon: Flag, roles: [UserRole.Citizen], path: 'report' },
    { name: 'Rewards', icon: Gift, roles: [UserRole.Citizen], path: 'rewards' },
    { name: 'My Reports', icon: Flag, roles: [UserRole.Citizen], path: 'my-reports' },
    { name: 'Request Credits', icon: Building, roles: [UserRole.Company], path: 'credits' },
    { name: 'Impact Report', icon: BarChart, roles: [UserRole.Company], path: 'impact' },
    { name: 'Available Projects', icon: Handshake, roles: [UserRole.Contractor], path: 'projects' },
    { name: 'My Bids', icon: Handshake, roles: [UserRole.Contractor], path: 'my-bids' },
    { name: 'Live Heatmap', icon: Map, roles: [UserRole.Citizen, UserRole.Company, UserRole.Contractor, UserRole.Admin], path: 'heatmap' },
    { name: 'AI Insights', icon: Bot, roles: [UserRole.Citizen, UserRole.Company, UserRole.Contractor, UserRole.Admin], path: 'ai-insights' },
    { name: 'Admin Panel', icon: Settings, roles: [UserRole.Admin], path: 'admin' },
];

interface TopNavProps {
    currentView: string;
    setView: (view: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ currentView, setView }) => {
    const { user } = useContext(AppContext) as IAppContext;
    
    const handleNavClick = (path: string) => {
        setView(path);
    }

    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <nav className="bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 px-2 sm:px-4 shadow-md relative z-20">
            <div className="flex items-center space-x-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {filteredNavItems.map((item, index) => (
                    <a
                        key={item.name}
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleNavClick(item.path); }}
                        className={`flex items-center px-4 py-3 text-sm font-semibold transition-all duration-300 group border-b-3 rounded-t-lg relative ${
                            currentView === item.path 
                            ? 'border-green-400 text-green-400 bg-gradient-to-b from-gray-900/80 to-gray-800/60 shadow-lg' 
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/40'
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {currentView === item.path && (
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-400/5 rounded-t-lg"></div>
                        )}
                        <item.icon className={`w-5 h-5 mr-2 transition-all duration-300 relative z-10 ${
                            currentView === item.path 
                            ? 'text-green-400 transform scale-110' 
                            : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-110'
                        }`} />
                        <span className="relative z-10">{item.name}</span>
                        {currentView === item.path && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-green-300"></div>
                        )}
                    </a>
                ))}
            </div>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; } 
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </nav>
    );
};

export default TopNav;
