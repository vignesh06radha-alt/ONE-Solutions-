
import React, { useState, useEffect, useContext } from 'react';
import Card from '../../../components/Card';
import { Problem, ProblemStatus } from '../../../types';
import { AppContext, IAppContext } from '../../../contexts/AppContext';
import AIAnalysisResult from './AIAnalysisResult';

interface MyReportsProps {
  limit?: number;
}

const getStatusInfo = (status: ProblemStatus): { className: string, text: string } => {
    switch(status) {
        case ProblemStatus.Completed: return { className: 'bg-green-500/10 text-green-400 border-green-500/20', text: status };
        case ProblemStatus.InProgress: return { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: status };
        case ProblemStatus.Assigned: return { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: status };
        case ProblemStatus.Classified: return { className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', text: status };
        case ProblemStatus.Pending: return { className: 'bg-gray-700 text-gray-300 border-gray-600 animate-pulse', text: status };
        default: return { className: 'bg-gray-800 text-gray-400 border-gray-700', text: status };
    }
}

const MyReports: React.FC<MyReportsProps> = ({ limit }) => {
  const { user } = useContext(AppContext) as IAppContext;
  const [reports, setReports] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const problemIds = await window.storage.get('problems:list') || [];
      const problemPromises = problemIds.map((id: string) => window.storage.get(`problem:${id}`));
      let allProblems: Problem[] = (await Promise.all(problemPromises)).filter(p => p != null && p.userId === user?.id);
      allProblems.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if(limit) {
          allProblems = allProblems.slice(0, limit);
      }
      setReports(allProblems);
      setLoading(false);
    };
    if (user) {
      fetchReports();
    }
  }, [user, limit]);

  if(loading) return <Card title="My Reports">Loading...</Card>

  return (
    <Card title="My Reports">
        <div className="space-y-4">
            {reports.map(report => {
                const statusInfo = getStatusInfo(report.status);
                return (
                    <div key={report.id} className="p-4 border border-gray-800 rounded-lg transition-colors duration-300 hover:bg-gray-800/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer" onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}>
                            <div>
                                <p className="font-semibold text-white">{report.aiAnalysis?.subcategory || 'Problem Report'}</p>
                                <p className="text-sm text-gray-400">{report.description.substring(0, 100)}...</p>
                                 <p className="text-xs text-gray-500 mt-1">{new Date(report.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-4">
                               <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusInfo.className}`}>
                                    {statusInfo.text}
                                </span>
                            </div>
                        </div>
                        {expandedReport === report.id && (
                            <div className="mt-4 pt-4 border-t border-gray-800 animate-fade-in-fast">
                               {report.aiAnalysis ? <AIAnalysisResult analysis={report.aiAnalysis} /> : <p className="text-yellow-400">AI analysis is pending.</p>}
                            </div>
                        )}
                    </div>
                );
            })}
             {reports.length === 0 && <p className="text-gray-500 text-center py-4">You haven't submitted any reports yet.</p>}
        </div>
        <style>{`
            @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in-fast { animation: fadeInFast 0.3s ease-out forwards; }
        `}</style>
    </Card>
  )
};

export default MyReports;