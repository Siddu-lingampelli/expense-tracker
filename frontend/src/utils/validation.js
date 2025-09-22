import { z } from 'zod';
import { formatCurrency } from './format';

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_MATCH: 'Passwords do not match',
  INVALID_DATE: 'Please enter a valid date',
  FUTURE_DATE: 'Date cannot be in the future',
  PAST_DATE: 'Date cannot be in the past',
  MIN_AMOUNT: 'Amount must be greater than 0',
  MAX_AMOUNT: (max) => `Amount cannot exceed ${formatCurrency(max)}`,
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PERCENTAGE: 'Please enter a valid percentage (0-100)',
};

/**
 * Common validation schemas
 */

export const emailSchema = z
  .string()
  .min(1, { message: VALIDATION_MESSAGES.REQUIRED })
  .email({ message: VALIDATION_MESSAGES.EMAIL });

export const passwordSchema = z
  .string()
  .min(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const confirmPasswordSchema = (fieldName = 'password') => ({
  [fieldName]: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
  confirmPassword: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
}).refine((data) => data[fieldName] === data.confirmPassword, {
  message: VALIDATION_MESSAGES.PASSWORD_MATCH,
  path: ['confirmPassword'],
});

export const amountSchema = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) || 0 : val))
  .refine((val) => !isNaN(val) && val > 0, {
    message: VALIDATION_MESSAGES.MIN_AMOUNT,
  });

export const dateSchema = z.union([z.date(), z.string()]).transform((val) => {
  if (val instanceof Date) return val;
  const date = new Date(val);
  return isNaN(date.getTime()) ? null : date;
});

export const pastDateSchema = dateSchema.refine(
  (date) => date <= new Date(),
  VALIDATION_MESSAGES.FUTURE_DATE
);

export const futureDateSchema = dateSchema.refine(
  (date) => date >= new Date(),
  VALIDATION_MESSAGES.PAST_DATE
);

export const phoneSchema = z
  .string()
  .min(1, { message: VALIDATION_MESSAGES.REQUIRED })
  .refine((val) => /^[\d\s\-+()]{10,20}$/.test(val), {
    message: VALIDATION_MESSAGES.INVALID_PHONE,
  });

export const urlSchema = z
  .string()
  .url({ message: VALIDATION_MESSAGES.INVALID_URL });

export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage cannot exceed 100');

/**
 * Form-specific schemas
 */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORD_MATCH,
    path: ['confirmPassword'],
  });

export const transactionSchema = z.object({
  description: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
  amount: amountSchema,
  type: z.enum(['income', 'expense'], {
    required_error: 'Please select a transaction type',
  }),
  category: z.string().min(1, { message: 'Please select a category' }),
  date: pastDateSchema,
  account: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  profilePicture: z.any().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: VALIDATION_MESSAGES.PASSWORD_MATCH,
    path: ['confirmNewPassword'],
  });

export const budgetSchema = z.object({
  name: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED }),
  amount: amountSchema,
  category: z.string().min(1, { message: 'Please select a category' }),
  period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], {
    required_error: 'Please select a budget period',
  }),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  notes: z.string().optional(),
});

/**
 * Helper functions
 */

/**
 * Parse form data with Zod schema
 * @param {Object} formData - The form data to validate
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @returns {Object} - Object containing success status, data, and errors
 */
export const parseFormData = (formData, schema) => {
  try {
    const result = schema.safeParse(formData);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: {},
      };
    }

    // Format errors into a more usable format
    const formattedErrors = result.error.errors.reduce((acc, error) => {
      const path = error.path.join('.');
      acc[path] = error.message;
      return acc;
    }, {});

    return {
      success: false,
      data: null,
      errors: formattedErrors,
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      data: null,
      errors: { form: 'An error occurred during validation' },
    };
  }
};

/**
 * Get the first error message for a field
 * @param {Object} errors - The errors object from form validation
 * @param {string} field - The field name to get the error for
 * @returns {string|undefined} - The error message or undefined if no error
 */
export const getFieldError = (errors, field) => {
  if (!errors || !field) return undefined;
  return errors[field];
};

/**
 * Check if a field has an error
 * @param {Object} errors - The errors object from form validation
 * @param {string} field - The field name to check
 * @returns {boolean} - True if the field has an error
 */
export const hasError = (errors, field) => {
  return Boolean(getFieldError(errors, field));
};

/**
 * Format form data before validation
 * @param {Object} data - The form data to format
 * @param {Object} schema - The schema with formatting rules
 * @returns {Object} - The formatted form data
 */
export const formatFormData = (data, schema) => {
  const formattedData = { ...data };
  
  // Format amount fields to numbers
  const amountFields = Object.keys(schema.shape).filter(
    (key) => schema.shape[key]._def.typeName === 'ZodNumber' && key.toLowerCase().includes('amount')
  );
  
  amountFields.forEach((field) => {
    if (field in formattedData) {
      const value = formattedData[field];
      if (typeof value === 'string') {
        formattedData[field] = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
      }
    }
  });
  
  // Format date fields to Date objects
  const dateFields = Object.keys(schema.shape).filter(
    (key) => {
      const type = schema.shape[key]._def.typeName;
      return type === 'ZodDate' || (type === 'ZodUnion' && key.toLowerCase().includes('date'));
    }
  );
  
  dateFields.forEach((field) => {
    if (field in formattedData && formattedData[field]) {
      const value = formattedData[field];
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          formattedData[field] = date;
        }
      }
    }
  });
  
  return formattedData;
};
