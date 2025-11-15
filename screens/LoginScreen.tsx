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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center">
        <div className="flex justify-center items-center gap-4 mb-6 animate-fade-in-down">
          <Logo userRole={null} className="h-16 w-16 text-green-400" />
          <h1 className="text-5xl md:text-6xl font-bold text-white bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
            Welcome to ONE
          </h1>
        </div>
        <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto animate-fade-in-up">
          The AI-powered platform connecting communities to build a better, cleaner future, one report at a time.
        </p>
        <p className="text-sm text-gray-500 mb-12 max-w-2xl mx-auto">
          Report problems • Earn credits • Redeem rewards • Make a difference
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
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] relative overflow-hidden"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.15}s backwards` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex justify-center items-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-400/10 mx-auto mb-4 border border-green-500/30">
                    <Icon className="h-8 w-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">I am a {role}</h2>
                  <p className="text-gray-400 mb-6 min-h-[3rem]">{descriptions[role]}</p>
                  <button
                    onClick={() => handleLogin(role)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-4 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-200 flex items-center justify-center group shadow-lg hover:shadow-green-500/50"
                  >
                    Enter as {role}
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
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
