import { asyncHandler } from "../../shared/http/asyncHandler";
import { apiResponse } from "../../shared/http/apiResponse";
import { redis } from "../../config/redis";
import { UnauthorizedError, NotFoundError } from "../../shared/http/apiError";
import AuthRepository from "../auth.repository";
import { VerifyOtpSchema } from "../auth.validation";

export const verifyOtpController = asyncHandler(async (req, res) => {
  
  const input = VerifyOtpSchema.parse(req.body);
  
  const repository = new AuthRepository();
  
  const user = await repository.findUserByEmail(input.email);
  if (!user) throw new NotFoundError("No account found for this email");

  const storedOtp = await redis.get(`registration:otp:${input.email}`);
  if (!storedOtp || storedOtp !== input.otp) {
    throw new UnauthorizedError("Invalid or expired OTP");
  }

  await repository.markUserVerified(user.id);
  await redis.del(`registration:otp:${input.email}`);
  
  res.status(200).json(apiResponse(null, "Email verified successfully"));
});
