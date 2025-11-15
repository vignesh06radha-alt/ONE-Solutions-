export interface N8nClassifyProblemPayload {
  // The webhook expects a JSON object with these two text fields:
  // - `problem`: the citizen's problem description (plain text)
  // - `location`: the problem location serialized as text (e.g. "lat: X, lng: Y")
  problem: string;
  location: string;
}

export interface N8nClassifyProblemResponse {
  category: 'green' | 'infra' | 'other';
  severityScore: number;
  environmentalPriority: number;
  confidence: number;
  rationale: string;
}

export interface N8nAllocateTokensPayload {
  category: string;
  severityScore: number;
  environmentalPriority: number;
}

export interface N8nAllocateTokensResponse {
  oneCreditsToAllocate: number;
  rationale: string;
}

export interface N8nBid {
  bidId: string;
  contractorId: string;
  quoteAmount: number;
  contractorTrustScore: number;
  contractorCompletedJobs: number;
}

export interface N8nSelectBidPayload {
  problemId: string;
  bids: N8nBid[];
}

export interface N8nSelectBidResponse {
  selectedBidId: string;
  selectedContractorId: string;
  rationale: string;
  score: number;
}
