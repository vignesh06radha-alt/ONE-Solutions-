import React, { useState } from 'react';
import Card from './Card';
import { AlertTriangle, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface Emergency {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  location: string;
  timestamp: string;
  status: 'active' | 'resolved';
  userId: string;
}

const EmergencyInfo: React.FC<{ userId: string }> = ({ userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentEmergencies, setRecentEmergencies] = useState<Emergency[]>([]);

  const handleSubmitEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !location) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const emergency: Emergency = {
        id: uuidv4(),
        title,
        description,
        severity,
        location,
        timestamp: new Date().toISOString(),
        status: 'active',
        userId,
      };

      // Save to storage
      const emergenciesList = (await window.storage.get('emergencies:list')) || [];
      await window.storage.set('emergencies:list', [...emergenciesList, emergency.id], true);
      await window.storage.set(`emergency:${emergency.id}`, emergency, true);

      // Fetch updated list
      const emergencyIds = await window.storage.get('emergencies:list');
      const emergencies = await Promise.all(
        (emergencyIds || []).map((id: string) => window.storage.get(`emergency:${id}`))
      );
      setRecentEmergencies(emergencies.filter((e: Emergency) => e && e.status === 'active').slice(0, 5));

      toast.success('Emergency alert submitted! First responders have been notified.');
      setTitle('');
      setDescription('');
      setLocation('');
      setSeverity('high');
    } catch (error) {
      console.error('Error submitting emergency:', error);
      toast.error('Failed to submit emergency alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card title="🚨 Report Emergency Situation" className="border-red-500/50 bg-red-500/10">
        <form onSubmit={handleSubmitEmergency} className="space-y-4">
          <div>
            <label htmlFor="emergency-title" className="block text-sm font-medium text-gray-300">
              Emergency Type
            </label>
            <input
              id="emergency-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Tree fallen on highway, Gas leak, Road collapse"
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm text-gray-300"
            />
          </div>

          <div>
            <label htmlFor="emergency-desc" className="block text-sm font-medium text-gray-300">
              Detailed Description
            </label>
            <textarea
              id="emergency-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide as much detail as possible about the emergency situation..."
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm text-gray-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergency-location" className="block text-sm font-medium text-gray-300">
                Location
              </label>
              <input
                id="emergency-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Main St near 5th Ave"
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm text-gray-300"
              />
            </div>

            <div>
              <label htmlFor="emergency-severity" className="block text-sm font-medium text-gray-300">
                Severity Level
              </label>
              <select
                id="emergency-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as 'critical' | 'high' | 'medium')}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm text-gray-300"
              >
                <option value="medium">Medium - Needs attention</option>
                <option value="high">High - Urgent</option>
                <option value="critical">Critical - Immediate danger</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="h-5 w-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Emergency Alert'}
          </button>
        </form>
      </Card>

      {recentEmergencies.length > 0 && (
        <Card title="Recent Active Emergencies">
          <div className="space-y-3">
            {recentEmergencies.map((emergency) => (
              <div
                key={emergency.id}
                className={`p-4 rounded-lg border ${getSeverityColor(
                  emergency.severity
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{emergency.title}</h4>
                    <p className="text-sm mt-1">{emergency.description}</p>
                    <p className="text-xs mt-2 text-gray-400">
                      📍 {emergency.location} • {new Date(emergency.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityColor(emergency.severity)}`}>
                    {emergency.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmergencyInfo;
