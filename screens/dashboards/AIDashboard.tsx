
import React, { useContext, useState, useEffect } from 'react';
import { AppContext, IAppContext } from '../../contexts/AppContext';
import Card from '../../components/Card';
import { AISystemStatus } from '../../types';
import { Power, Cpu, Clock, AlertTriangle } from 'lucide-react';

const AIDashboard: React.FC = () => {
  const { aiConfig, setAiConfig } = useContext(AppContext) as IAppContext;
  const [status, setStatus] = useState<AISystemStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
        const data = await window.storage.get('ai:status');
        setStatus(data);
    };
    fetchStatus();
  }, []);

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiConfig(prev => ({ ...prev, mode: e.target.value as 'MOCK' | 'PRODUCTION' }));
  };

  return (
    <div className="space-y-6">
      <Card title="AI System Status">
        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg flex items-center ${status.online ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <Power className={`h-8 w-8 mr-4 ${status.online ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
                <p className="text-xl font-bold">{status.online ? 'Online' : 'Offline'}</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center">
              <Cpu className="h-8 w-8 mr-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Processing Queue</p>
                <p className="text-xl font-bold">{status.queueSize} reports</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center">
              <Clock className="h-8 w-8 mr-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Response Time</p>
                <p className="text-xl font-bold">{status.avgResponseTime}ms</p>
              </div>
            </div>
             <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center">
              <AlertTriangle className="h-8 w-8 mr-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Update</p>
                <p className="text-xl font-bold">{new Date(status.lastUpdate).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ) : <p>Loading AI status...</p>}
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="AI Transparency">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Our AI uses a multi-modal approach to analyze reports, combining natural language processing for descriptions and computer vision for images.</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Severity Scoring:</strong> Considers factors like environmental impact, public safety risk, and report urgency.</li>
                <li><strong>Credit Allocation:</strong> Proportional to the problem's severity and the quality of the report.</li>
                <li><strong>Bid Evaluation:</strong> Ranks bids based on cost-effectiveness, contractor performance history, and proposed timeline.</li>
            </ul>
          </div>
        </Card>

        <Card title="AI Configuration (Dev Panel)">
          <p className="text-sm mb-4">Switch between mock data and the live production AI endpoint.</p>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input type="radio" value="MOCK" checked={aiConfig.mode === 'MOCK'} onChange={handleModeChange} className="form-radio text-blue-600"/>
              <span className="ml-2">Mock Mode</span>
            </label>
            <label className="flex items-center">
              <input type="radio" value="PRODUCTION" checked={aiConfig.mode === 'PRODUCTION'} onChange={handleModeChange} className="form-radio text-blue-600"/>
              <span className="ml-2">Production Mode</span>
            </label>
          </div>
          <div className="mt-4 text-xs bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md">
            <strong>Note:</strong> Production API is not implemented in this demo. Switching to Production mode will use a fallback to the Mock service.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIDashboard;
