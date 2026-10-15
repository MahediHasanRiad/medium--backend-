import { asyncHandler } from "../../shared/http/asyncHandler";
import { apiResponse } from "../../shared/http/apiResponse";
import { redis } from "../../config/redis";
import { sendEmail } from "../../shared/email/send-email";
import { generateOtp } from "../../shared/otp/otp";
import { NotFoundError, UnauthorizedError } from "../../shared/http/apiError";
import AuthRepository from "../auth.repository";
import { ResendOtpSchema } from "../auth.validation";

const OTP_TTL_SECONDS = 300;

export const resendOTPController = asyncHandler(async (req, res) => {

  const { email } = ResendOtpSchema.parse(req.body);

  const user = await new AuthRepository().findUserByEmail(email);
  if (!user) throw new NotFoundError("No account found for this email");

  if (user.isVerified) throw new UnauthorizedError("Email is already verified");

  const otp = generateOtp();
  await sendEmail(email, otp);
  
  await redis.set(
    `registration:otp:${email}`,
    String(otp),
    "EX",
    OTP_TTL_SECONDS,
  );
  res.status(200).json(apiResponse(null, "OTP sent successfully"));
});
