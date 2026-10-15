import { redis } from "../../config/redis";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { apiResponse } from "../../shared/http/apiResponse";
import { sendEmail } from "../../shared/email/send-email";
import { generateOtp } from "../../shared/otp/otp";
import AuthRepository from "../auth.repository";
import { ForgotPasswordSchema } from "../auth.validation";

const RESET_OTP_TTL_SECONDS = 300;

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = ForgotPasswordSchema.parse(req.body);
  const user = await new AuthRepository().findUserByEmail(email);

  // Keep this response identical for known and unknown emails.
  if (user) {
    const otp = generateOtp();
    await sendEmail(email, otp);
    await redis.set(`password-reset:otp:${email}`, String(otp), "EX", RESET_OTP_TTL_SECONDS);
  }

  res.status(200).json(apiResponse(null, "If an account exists, a password reset OTP has been sent"));
});
