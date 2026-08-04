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
  experience: z.string().optional().default(""),
  medicalRegNumber: z.string().optional().default(""),
  location: locationSchema,
});
