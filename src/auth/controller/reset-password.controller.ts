import bcrypt from "bcrypt";
import { redis } from "../../config/redis";
import { NotFoundError, UnauthorizedError } from "../../shared/http/apiError";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { apiResponse } from "../../shared/http/apiResponse";
import AuthRepository from "../auth.repository";
import { ResetPasswordSchema } from "../auth.validation";

export const resetPasswordController = asyncHandler(async (req, res) => {
  const input = ResetPasswordSchema.parse(req.body);
  const repository = new AuthRepository();
  const user = await repository.findUserByEmail(input.email);

  if (!user) throw new NotFoundError("No account found for this email");

  const storedOtp = await redis.get(`password-reset:otp:${input.email}`);
  if (!storedOtp || storedOtp !== input.otp) {
    throw new UnauthorizedError("Invalid or expired OTP");
  }

  const password = await bcrypt.hash(input.newPassword, 12);
  await repository.resetPassword(user.id, password);
  await redis.del(`password-reset:otp:${input.email}`);
  res.status(200).json(apiResponse(null, "Password reset successfully"));
});
