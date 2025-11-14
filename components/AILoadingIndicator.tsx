
import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

const steps = [
  "Connecting to AI Agent...",
  "Analyzing image data...",
  "Categorizing problem...",
  "Calculating severity score...",
  "Allocating One Credits...",
];

const AILoadingIndicator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
      <h4 className="font-semibold text-green-400">AI Analysis in Progress...</h4>
      <ul className="space-y-2">
        {steps.map((step, index) => (
          <li key={index} className="flex items-center text-sm transition-all duration-300">
            {index < currentStep ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
            ) : (
              <Loader className={`h-5 w-5 text-green-400/80 mr-2 flex-shrink-0 ${index === currentStep ? 'animate-spin' : ''}`} />
            )}
            <span className={index <= currentStep ? 'text-gray-200' : 'text-gray-500'}>
              {step}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AILoadingIndicator;