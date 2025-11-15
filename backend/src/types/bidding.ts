export interface Bid {
  bidId: string;
  contractorId: string;
  problemId: string;
  quoteAmount: number;
  notes: string;
  createdAt: Date;
}

export interface BiddingSession {
  biddingSessionId: string;
  problemId: string;
  bids: Bid[];
  selectedBidId?: string;
  selectedContractorId?: string;
  n8nRationale?: string;
  status: 'open' | 'closed' | 'awarded';
  closedAt?: Date;
  awardedAt?: Date;
}

export interface CreateBidRequest {
  problemId: string;
  quoteAmount: number;
  notes: string;
}

export interface SelectBidRequest {
  biddingSessionId: string;
}
