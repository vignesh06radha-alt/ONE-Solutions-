import React, { useContext, useState, useEffect } from 'react';
import { AppContext, IAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import Header from '../components/Header';
import TopNav from '../components/TopNav';
import CitizenDashboard from './dashboards/CitizenDashboard';
import CompanyDashboard from './dashboards/CompanyDashboard';
import ContractorDashboard from './dashboards/ContractorDashboard';
import HeatmapDashboard from './dashboards/HeatmapDashboard';
import AIDashboard from './dashboards/AIDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useContext(AppContext) as IAppContext;
  const [currentView, setCurrentView] = useState('dashboard');
  
  useEffect(() => {
    toast.success(`Welcome back, ${user?.name}!`);
  }, [user]);

  const renderContent = () => {
    const viewKey = `${currentView}-${user?.role}`;
    return (
      <div key={viewKey} className="animate-fade-in">
        {(() => {
          switch (currentView) {
            case 'heatmap':
              return <HeatmapDashboard />;
            case 'ai-insights':
              return <AIDashboard />;
            case 'admin':
              return <AdminDashboard />;
          }

          if (user?.role === UserRole.Citizen) {
              return <CitizenDashboard view={currentView} setView={setCurrentView} />;
          }
          if (user?.role === UserRole.Company) {
              return <CompanyDashboard view={currentView} setView={setCurrentView} />;
          }
          if (user?.role === UserRole.Contractor) {
              return <ContractorDashboard view={currentView} setView={setCurrentView} />;
          }
           if (user?.role === UserRole.Admin) {
              if (currentView === 'dashboard') return <AdminDashboard />;
          }

          return <div>Dashboard for your role is not available.</div>;
        })()}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-black text-gray-200">
      <Header />
      <TopNav currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Dashboard;
