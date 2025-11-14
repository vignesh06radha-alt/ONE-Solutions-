
import React, { useState, useEffect, useContext } from 'react';
import { Problem } from '../../types';
import Card from '../../components/Card';
import Heatmap from '../../components/Heatmap';
import { AppContext, IAppContext } from '../../contexts/AppContext';
import AIAnalysisResult from './shared/AIAnalysisResult';

const HeatmapDashboard: React.FC = () => {
  const { AIService } = useContext(AppContext) as IAppContext;
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const problemIds = await window.storage.get('problems:list') || [];
      const problemPromises = problemIds.map((id: string) => window.storage.get(`problem:${id}`));
      const allProblems: Problem[] = (await Promise.all(problemPromises)).filter(p => p != null);
      setProblems(allProblems);
      
      if (allProblems.length > 0) {
        const { recommendations } = await AIService.generateHeatmapData(allProblems);
        setAiRecommendations(recommendations);
      }

      setLoading(false);
    };
    fetchData();
  }, [AIService]);

  const handleMarkerClick = (problem: Problem) => {
    setSelectedProblem(null); // Reset to trigger transition
    setTimeout(() => {
        setSelectedProblem(problem);
    }, 50);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      <div className="lg:col-span-2 h-full">
        <Card className="h-full w-full p-2" title="Live Problem Heatmap">
          {loading ? <p>Loading map data...</p> : <Heatmap problems={problems} onMarkerClick={handleMarkerClick} />}
        </Card>
      </div>
      <div className="lg:col-span-1 h-full overflow-y-auto pr-2">
        <div className="space-y-6">
          <Card title="AI Insights">
            {aiRecommendations.length > 0 ? (
                <ul className="space-y-2 text-sm">
                    {aiRecommendations.map((rec, index) => (
                        <li key={index} className="p-3 bg-green-500/10 rounded-md text-green-300 border border-green-500/20">{rec}</li>
                    ))}
                </ul>
            ) : <p>Generating insights...</p>}
          </Card>
          <div className={`transition-all duration-500 ease-out ${selectedProblem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            {selectedProblem && (
                <Card title="Selected Problem Details" actions={
                    <button onClick={() => setSelectedProblem(null)} className="text-xs text-gray-400 hover:text-white">Clear</button>
                }>
                    <h4 className="font-bold text-white">{selectedProblem.aiAnalysis?.subcategory || "Problem"}</h4>
                    <p className="text-sm my-2 text-gray-300">{selectedProblem.description}</p>
                    <img src={selectedProblem.image} alt="Problem" className="rounded-lg my-2" />
                    {selectedProblem.aiAnalysis ? <AIAnalysisResult analysis={selectedProblem.aiAnalysis} /> : <p>AI analysis pending.</p>}
                </Card>
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapDashboard;