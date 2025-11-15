import { db } from '../config/firebase';
import {
  GreenCreditPurchase,
  CreditAllocation,
  PurchaseGreenCreditRequest,
  AllocateGreenCreditRequest,
} from '../types/credit';
import { COLLECTIONS } from '../config/constants';
import { generateId } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class CreditService {
  async purchaseGreenCredits(
    companyId: string,
    data: PurchaseGreenCreditRequest
  ): Promise<GreenCreditPurchase> {
    try {
      const creditId = generateId('gc_purch');
      const totalCost = data.amountPurchased * data.unitPrice;

      const purchase: GreenCreditPurchase = {
        creditPurchaseId: creditId,
        companyId,
        amountPurchased: data.amountPurchased,
        unitPrice: data.unitPrice,
        totalCost,
        currentBalance: data.amountPurchased,
        allocationLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db
        .collection(COLLECTIONS.GREEN_CREDITS)
        .doc(creditId)
        .set(purchase);

      logger.info(
        `Green credits purchased: ${creditId} - Amount: ${data.amountPurchased}`
      );
      return purchase;
    } catch (error) {
      logger.error('Error purchasing green credits:', error);
      throw error;
    }
  }

  async getGreenCreditBalance(companyId: string): Promise<number> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.GREEN_CREDITS)
        .where('companyId', '==', companyId)
        .get();

      let totalBalance = 0;
      snapshot.docs.forEach((doc: any) => {
        const purchase = doc.data() as GreenCreditPurchase;
        totalBalance += purchase.currentBalance;
      });

      return totalBalance;
    } catch (error) {
      logger.error('Error fetching green credit balance:', error);
      throw error;
    }
  }

  async allocateGreenCredits(data: AllocateGreenCreditRequest): Promise<void> {
    try {
      const allocation: CreditAllocation = {
        allocationId: generateId('alloc'),
        problemId: data.problemId,
        amountSpent: data.amountToAllocate,
        allocatedAt: new Date(),
      };

      // Find a purchase with enough balance and update it
      const snapshot = await db
        .collection(COLLECTIONS.GREEN_CREDITS)
        .where('currentBalance', '>=', data.amountToAllocate)
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new NotFoundError('Insufficient green credits available');
      }

      const purchaseDoc = snapshot.docs[0];
      const purchase = purchaseDoc.data() as GreenCreditPurchase;

      // Update purchase
      purchase.currentBalance -= data.amountToAllocate;
      purchase.allocationLogs.push(allocation);

      await db
        .collection(COLLECTIONS.GREEN_CREDITS)
        .doc(purchaseDoc.id)
        .update({
          currentBalance: purchase.currentBalance,
          allocationLogs: purchase.allocationLogs,
          updatedAt: new Date(),
        });

      logger.info(`Green credits allocated: ${data.amountToAllocate} to ${data.problemId}`);
    } catch (error) {
      logger.error('Error allocating green credits:', error);
      throw error;
    }
  }

  async getGreenCreditHistory(companyId: string): Promise<GreenCreditPurchase[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.GREEN_CREDITS)
        .where('companyId', '==', companyId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as GreenCreditPurchase);
    } catch (error) {
      logger.error('Error fetching green credit history:', error);
      throw error;
    }
  }
}

export const creditService = new CreditService();
