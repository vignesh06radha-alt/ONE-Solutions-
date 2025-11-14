
import React from 'react';
import { AIAnalysis } from '../../../types';
import { Bot, Check, Thermometer, BrainCircuit, DollarSign } from 'lucide-react';

interface AIAnalysisResultProps {
  analysis: AIAnalysis;
}

const AIAnalysisResult: React.FC<AIAnalysisResultProps> = ({ analysis }) => {
  const severityColor = analysis.severity > 7.5 ? 'text-red-500' : analysis.severity > 5 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-4 text-sm">
      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
        <p className="font-semibold flex items-center text-gray-300"><Bot className="h-4 w-4 mr-2" /> AI Reasoning</p>
        <p className="text-gray-400 italic">"{analysis.reasoning}"</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start">
          <Check className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
          <div>
            <p className="font-semibold text-gray-300">Category</p>
            <p className="text-gray-400">{analysis.category} / {analysis.subcategory}</p>
          </div>
        </div>
        <div className="flex items-start">
          <Thermometer className="h-4 w-4 mr-2 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-300">Severity Score</p>
            <p className={`font-bold text-lg ${severityColor}`}>{analysis.severity} / 10</p>
          </div>
        </div>
        <div className="flex items-start">
          <BrainCircuit className="h-4 w-4 mr-2 mt-0.5 text-yellow-400" />
          <div>
            <p className="font-semibold text-gray-300">AI Confidence</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${analysis.confidence * 100}%` }}></div>
            </div>
             <p className="text-xs text-gray-400">{(analysis.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
         <div className="flex items-start">
          <DollarSign className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
          <div>
            <p className="font-semibold text-gray-300">Credits Allocated</p>
            <p className="font-bold text-green-400 text-lg">{analysis.creditsAllocated}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisResult;