export interface GreenCreditPurchase {
  creditPurchaseId: string;
  companyId: string;
  amountPurchased: number;
  unitPrice: number;
  totalCost: number;
  currentBalance: number;
  allocationLogs: CreditAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditAllocation {
  allocationId: string;
  problemId: string;
  amountSpent: number;
  allocatedAt: Date;
}

export interface OneCredit {
  userId: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  updatedAt: Date;
}

export interface PurchaseGreenCreditRequest {
  amountPurchased: number;
  unitPrice: number;
}

export interface AllocateGreenCreditRequest {
  problemId: string;
  amountToAllocate: number;
}
