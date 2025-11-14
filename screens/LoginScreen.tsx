import React, { useContext } from 'react';
import { AppContext, IAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { USER_ROLE_ICONS } from '../constants';
import { ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const LoginScreen: React.FC = () => {
  const { login } = useContext(AppContext) as IAppContext;

  const handleLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center">
        <div className="flex justify-center items-center gap-4 mb-6 animate-fade-in-down">
          <Logo userRole={null} className="h-16 w-16 text-green-400" />
          <h1 className="text-5xl md:text-6xl font-bold text-white">Welcome to ONE</h1>
        </div>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in-up">
          The AI-powered platform connecting communities to build a better, cleaner future, one report at a time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[UserRole.Citizen, UserRole.Company, UserRole.Contractor].map((role, index) => {
            const Icon = USER_ROLE_ICONS[role];
            const descriptions = {
                [UserRole.Citizen]: "Report issues, earn credits, and improve your community.",
                [UserRole.Company]: "Fund ecological projects and track your positive impact.",
                [UserRole.Contractor]: "Find and bid on projects to solve real-world problems."
            }
            return (
              <div 
                key={role} 
                className="bg-[#111111] rounded-lg shadow-lg p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-800 hover:border-green-500/50 hover:shadow-[0_0_25px_rgba(52,211,153,0.2)]"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.15}s backwards` }}
              >
                <div className="flex justify-center items-center h-16 w-16 rounded-full bg-green-500/10 mx-auto mb-4">
                  <Icon className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">I am a {role}</h2>
                <p className="text-gray-400 mb-6">{descriptions[role]}</p>
                <button
                  onClick={() => handleLogin(role)}
                  className="w-full bg-green-500/90 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center group"
                >
                  Enter as {role}
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
       <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LoginScreen;
