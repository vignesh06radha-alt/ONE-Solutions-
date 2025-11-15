import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Bell, AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface DisasterAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'disaster' | 'emergency' | 'warning' | 'info';
  timestamp: string;
  location?: string;
  isRead: boolean;
}

const NotificationCenter: React.FC<{ userId: string }> = ({ userId }) => {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      const alertsList = (await window.storage.get('alerts:list')) || [];
      const fetchedAlerts = await Promise.all(
        (alertsList || []).map((id: string) => window.storage.get(`alert:${id}`))
      );
      const sorted = fetchedAlerts
        .filter((a: DisasterAlert) => a)
        .sort((a: DisasterAlert, b: DisasterAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAlerts(sorted);
      setUnreadCount(sorted.filter((a: DisasterAlert) => !a.isRead).length);
    };
    fetchAlerts();

    // Simulate incoming alerts every 30 seconds for demo
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (alertId: string) => {
    const alert = await window.storage.get(`alert:${alertId}`);
    if (alert) {
      alert.isRead = true;
      await window.storage.set(`alert:${alertId}`, alert, true);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const deleteAlert = async (alertId: string) => {
    const alertsList = (await window.storage.get('alerts:list')) || [];
    const filtered = alertsList.filter((id: string) => id !== alertId);
    await window.storage.set('alerts:list', filtered, true);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'disaster':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'emergency':
        return <AlertCircle className="h-5 w-5 text-orange-400" />;
      case 'warning':
        return <Info className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  return (
    <Card title="📢 Disaster & Alert Center" className="border-blue-500/30 bg-blue-500/5">
      <div className="space-y-4">
        {/* Alert Summary Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-8 w-8 text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {unreadCount > 0 ? `${unreadCount} New Alert${unreadCount > 1 ? 's' : ''}` : 'No new alerts'}
              </p>
              <p className="text-xs text-gray-400">{alerts.length} total alerts</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isExpanded ? 'Collapse' : 'View All'}
          </button>
        </div>

        {/* Alerts List */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-700 rounded-lg p-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2 opacity-50" />
                <p className="text-gray-400">All clear! No active alerts.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => markAsRead(alert.id)}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} ${
                    alert.isRead ? 'opacity-60' : 'opacity-100'
                  } hover:opacity-100 transition-opacity cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{alert.title}</h4>
                        <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                          {alert.location && (
                            <>
                              <span>📍 {alert.location}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          {!alert.isRead && (
                            <>
                              <span>•</span>
                              <span className="text-blue-400 font-semibold">NEW</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAlert(alert.id);
                      }}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick Stats */}
        {!isExpanded && alerts.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-gray-900/50 rounded">
              <p className="font-semibold text-red-400">
                {alerts.filter((a) => a.severity === 'critical').length}
              </p>
              <p className="text-gray-400">Critical</p>
            </div>
            <div className="p-2 bg-gray-900/50 rounded">
              <p className="font-semibold text-orange-400">
                {alerts.filter((a) => a.severity === 'high').length}
              </p>
              <p className="text-gray-400">High</p>
            </div>
            <div className="p-2 bg-gray-900/50 rounded">
              <p className="font-semibold text-yellow-400">
                {alerts.filter((a) => a.severity === 'medium').length}
              </p>
              <p className="text-gray-400">Medium</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NotificationCenter;
