import { ValidationError } from './errors';

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

export const validatePassword = (password: string) => {
  if (!password || password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }
};

export const validateProblemInput = (data: any) => {
  if (!data.description || data.description.trim().length === 0) {
    throw new ValidationError('Description is required');
  }
  if (data.description.length > 5000) {
    throw new ValidationError('Description cannot exceed 5000 characters');
  }
  if (!data.location || typeof data.location.lat !== 'number' || typeof data.location.lng !== 'number') {
    throw new ValidationError('Valid location (lat, lng) is required');
  }
  if (data.location.lat < -90 || data.location.lat > 90) {
    throw new ValidationError('Invalid latitude');
  }
  if (data.location.lng < -180 || data.location.lng > 180) {
    throw new ValidationError('Invalid longitude');
  }
};

export const validateBidInput = (data: any) => {
  if (!data.problemId || data.problemId.trim().length === 0) {
    throw new ValidationError('Problem ID is required');
  }
  if (!data.quoteAmount || data.quoteAmount <= 0) {
    throw new ValidationError('Quote amount must be greater than 0');
  }
  if (data.notes && data.notes.length > 1000) {
    throw new ValidationError('Notes cannot exceed 1000 characters');
  }
};

export const validateContractorRegistration = (data: any) => {
  if (!data.domain || data.domain.trim().length === 0) {
    throw new ValidationError('Domain/expertise is required');
  }
  if (!Array.isArray(data.serviceAreas) || data.serviceAreas.length === 0) {
    throw new ValidationError('Service areas are required');
  }
};

export const validateGreenCreditPurchase = (data: any) => {
  if (!data.amountPurchased || data.amountPurchased <= 0) {
    throw new ValidationError('Amount must be greater than 0');
  }
  if (!data.unitPrice || data.unitPrice <= 0) {
    throw new ValidationError('Unit price must be greater than 0');
  }
};
