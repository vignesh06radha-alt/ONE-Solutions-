
import { Problem, Bid, AIAnalysis } from '../types';
import { AIConfig } from '../contexts/AppContext';

/**
 * AI API INTEGRATION GUIDE
 * 
 * Replace MockAIService methods with production API calls.
 * This service is designed as a drop-in replacement.
 * 
 * --- Analyze Report ---
 * POST /api/ai/analyze-report
 * Body: {
 *   description: string,
 *   imageBase64: string, // if available
 *   location: {lat, lng},
 *   timestamp: string
 * }
 * Response: AIAnalysis object
 * 
 * --- Evaluate Bids ---
 * POST /api/ai/evaluate-bids
 * Body: {
 *   problemId: string,
 *   bids: Array<Bid>
 * }
 * Response: {
 *   recommendedBid: string, // ID of the recommended bid
 *   ranking: Array<Bid with aiScore, aiRanking, aiReasoning>
 * }
 * 
 * --- Heatmap Intelligence ---
 * GET /api/ai/heatmap-intelligence
 * Query: ?timeRange=...&filters=...
 * Response: {
 *   clusters: Array<{lat, lng, count, severity}>,
 *   priorities: Array<{problemId, score}>,
 *   recommendations: Array<string>
 * }
 */

export interface IaiService {
  analyzeReport: (reportData: Partial<Problem>) => Promise<AIAnalysis>;
  evaluateBids: (problemId: string, bids: Bid[]) => Promise<{ recommendedBid: string; ranking: Bid[] }>;
  generateHeatmapData: (problems: Problem[]) => Promise<{ clusters: any[], recommendations: string[] }>;
}

const simulateProcessing = (min: number, max: number) => 
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const MockAIService: IaiService = {
  analyzeReport: async (reportData) => {
    await simulateProcessing(2000, 5000);

    const desc = reportData.description?.toLowerCase() || '';
    let category = 'Civic';
    let subcategory = 'General';
    let severity = Math.random() * 4 + 1; // 1-5

    const greenKeywords = ['waste', 'pollution', 'dump', 'trash', 'ecological', 'environment', 'tree', 'river'];
    const infraKeywords = ['pothole', 'road', 'street', 'light', 'water', 'electrical', 'sewage', 'crack'];

    if (greenKeywords.some(k => desc.includes(k))) {
      category = 'Green/Ecological';
      subcategory = 'Waste Management';
      severity += 3; // Boost severity for environmental issues
    } else if (infraKeywords.some(k => desc.includes(k))) {
      category = 'Infrastructure';
      subcategory = 'Road Maintenance';
      severity += 2;
    }

    severity = Math.min(10, severity + (desc.length / 50)); // Longer description implies more detail/severity
    
    return {
      category,
      subcategory,
      severity: parseFloat(severity.toFixed(1)),
      creditsAllocated: Math.round(severity * 10),
      confidence: Math.random() * 0.15 + 0.85, // 85-100%
      reasoning: `Analysis based on keywords found in description. Severity score is ${severity > 7 ? 'high' : 'medium'} due to potential environmental impact and detailed description.`,
      estimatedImpact: severity > 7 ? 'High' : (severity > 4 ? 'Medium' : 'Low'),
      urgency: severity > 8 ? 'High' : 'Medium',
      suggestedContractors: ['contractor-1', 'contractor-3'],
    };
  },
  
  evaluateBids: async (problemId, bids) => {
    await simulateProcessing(3000, 6000);

    const rankedBids = bids.map(bid => {
      // Mock score based on amount (lower is better), and a random performance factor
      const priceScore = (1 - (bid.amount / 10000)) * 50; // Assume max bid is 10k
      const performanceScore = Math.random() * 50;
      const totalScore = Math.max(0, Math.min(100, priceScore + performanceScore));
      return { ...bid, aiScore: parseFloat(totalScore.toFixed(1)) };
    }).sort((a, b) => b.aiScore - a.aiScore);

    const finalRanking = rankedBids.map((bid, index) => ({
        ...bid,
        aiRanking: index + 1,
        aiReasoning: `Ranked #${index + 1} based on a competitive bid amount and strong simulated contractor performance metrics.`
    }));

    return {
      recommendedBid: finalRanking[0].id,
      ranking: finalRanking,
    };
  },

  generateHeatmapData: async (problems) => {
    await simulateProcessing(1000, 2500);

    const clusters = problems.map(p => ({
        lat: p.location.lat,
        lng: p.location.lng,
        intensity: p.aiAnalysis?.severity || 5,
        id: p.id,
    }));
    
    const highSeverityProblems = problems.filter(p => (p.aiAnalysis?.severity || 0) > 7);

    const recommendations = [
        `Hotspot Alert: ${highSeverityProblems.length} high-severity reports require attention.`,
        "Trend: Infrastructure issues increasing 23% this month (simulated).",
        "Recommendation: Prioritize green projects in areas with high report density.",
    ];
    
    return { clusters, recommendations };
  }
};

const ProductionAIService = (config: AIConfig): IaiService => ({
  analyzeReport: async (reportData) => {
    // In production, you would use fetch to call the real API
    // const response = await fetch(`${config.endpoint}/analyze-report`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(reportData),
    // });
    // if (!response.ok) throw new Error('AI analysis failed');
    // return response.json();
    console.warn("AI Service is in PRODUCTION mode, but using MOCK implementation as a fallback.");
    return MockAIService.analyzeReport(reportData);
  },
  evaluateBids: async (problemId, bids) => {
    console.warn("AI Service is in PRODUCTION mode, but using MOCK implementation as a fallback.");
    return MockAIService.evaluateBids(problemId, bids);
  },
  generateHeatmapData: async (problems) => {
    console.warn("AI Service is in PRODUCTION mode, but using MOCK implementation as a fallback.");
    return MockAIService.generateHeatmapData(problems);
  }
});

export const AIService = (config: AIConfig): IaiService => {
  if (config.mode === 'PRODUCTION') {
    return ProductionAIService(config);
  }
  return MockAIService;
};
