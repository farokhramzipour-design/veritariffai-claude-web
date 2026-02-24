import { z } from 'zod';

export const MoneySchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
  currency: z.string().length(3),
});

export const ShipmentLineSchema = z.object({
  line_number: z.number().int().positive(),
  hs_code: z.string().regex(/^\d{8,10}$/, 'Must be 8–10 digits'),
  description: z.string().min(3).max(100),
  invoice_value: MoneySchema,
  quantity: z.number().positive(),
  quantity_unit: z.string().min(1),
  gross_weight_kg: z.number().positive(),
  country_of_origin: z.string().length(2),
  has_proof_of_origin: z.boolean(),
});

export const Step1Schema = z.object({
  jurisdiction: z.enum(['UK', 'EU']),
  origin_country: z.string().length(2, { message: "Must be a 2-letter country code" }),
  destination_country: z.string().length(2),
  incoterm: z.enum(['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']),
  freight_cost: MoneySchema.optional(),
  insurance_cost: MoneySchema.optional(),
});
