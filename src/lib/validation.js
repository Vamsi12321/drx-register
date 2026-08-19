import { z } from "zod";

export const locationSchema = z.object({
  latitude: z.string().default(""),
  longitude: z.string().default(""),
  address: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
});

export const doctorRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  hospital: z.string().min(2, "Hospital name must be at least 2 characters").max(200),
  department: z.string().min(2, "Department must be at least 2 characters").max(100),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must include at least one symbol"),
  confirmPassword: z.string(),
  location: locationSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Generate username from full name
 * "Dr Vamshi Wakad" → "vamshi_wakad_123"
 * "Dr. Rahul Sharma" → "rahul_sharma_123"
 */
export function generateUsername(fullName) {
  if (!fullName) return "";
  let name = fullName.toLowerCase().trim();
  // Remove dr/dr. prefix
  name = name.replace(/^(dr\.?\s*)/i, "");
  // Replace spaces with underscore, remove special chars
  name = name.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  // Remove trailing/leading underscores
  name = name.replace(/^_+|_+$/g, "");
  if (!name) return "";
  // Append random 3-digit number
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${name}_${randomNum}`;
}

/**
 * Generate password from username: username@123
 */
export function generatePassword(username) {
  if (!username) return "";
  return `${username}@123`;
}
