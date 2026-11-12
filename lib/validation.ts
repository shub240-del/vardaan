import { z } from "zod";

export const BED_OPTIONS = ["<10", "10-29", "30-49", "50-100", "100+"] as const;
export const CLAIM_OPTIONS = ["<15", "15-40", "40-100", "100+", "not_sure"] as const;

const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((v) => !/[<>]/.test(v), "Invalid characters");

/** Normalises Indian mobile numbers to +91XXXXXXXXXX. */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;
  return `+91${ten}`;
}

export const signupSchema = z.object({
  fullName: text(2, 120),
  hospitalName: text(2, 160),
  role: text(2, 80),
  email: z.string().trim().toLowerCase().email().max(254).refine((v) => !/[\s/]/.test(v), "Invalid email"),
  phone: z
    .string()
    .trim()
    .transform(normalisePhone)
    .refine((v) => /^\+91[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number"),
  city: text(2, 80),
  state: text(2, 80),
  bedCapacity: z.enum(BED_OPTIONS),
  monthlyClaims: z.enum(CLAIM_OPTIONS),
  consent: z.literal(true),
  language: z.enum(["en", "hi"]).default("en"),
  // Spam protection
  website: z.string().max(0).optional().default(""), // honeypot: must be empty
  startedAt: z.number().int().positive(),
});

export type SignupInput = z.infer<typeof signupSchema>;

/** Common Indian free-mail domains are allowed; we only block obvious throwaway domains. */
const DISPOSABLE = ["mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com", "yopmail.com", "trashmail.com"];
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1] ?? "";
  return DISPOSABLE.includes(domain);
}
