import { z } from "zod";


export const UserRoleEnum = z.enum(["USER", "ADMIN"]);


export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30).nullable(),
  password: z.string(),
  role: UserRoleEnum.default("USER"),
  isVerified: z.boolean().default(false),

  displayName: z.string().max(50).nullable(),
  bio: z.string().max(500).nullable(),
  avatarUrl: z.string().nullable().optional(),
  websiteUrl: z.string().url("Invalid website URL").nullable(),
  address: z.string().max(255).nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for User Registration / Creation (inputs from client)
export const CreateUserSchema = UserSchema.pick({
  email: true,
  password: true,
  username: true,
  avatarUrl: true,
}).extend({
  password: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export const ResendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const NewPasswordSchema = z.string();

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: NewPasswordSchema,
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  newPassword: NewPasswordSchema,
});


export const UpdateUserSchema = z.object({
    username: z.string().min(3).max(30).optional().nullable(),
    displayName: z.string().max(50).optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    avatarUrl: z.object({
      fieldname: z.string(),
      originalname: z.string(),
      mimetype: z.string().refine(
        (type: any) => ["image/jpeg", "image/png", "image/webp"].includes(type as any),
        { message: "Only .jpg, .png, and .webp formats are allowed" }
      ),
      size: z.number().max(5 * 1024 * 1024, "File size must be less than 5MB"),
      path: z.string(),
    }).optional().nullable(),
  
    websiteUrl: z.string().url().optional().nullable(),
    address: z.string().max(255).optional().nullable(),
  });


export const AdminUpdateUserSchema = UpdateUserSchema.extend({
  role: UserRoleEnum.optional(),
  isVerified: z.boolean().optional(),
  email: z.string().email().optional(),
});


export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserSchema>;
