import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { UnauthorizedError } from "../../shared/http/apiError";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { apiResponse } from "../../shared/http/apiResponse";
import AuthRepository from "../auth.repository";
import { UpdatePasswordSchema } from "../auth.validation";

function bearerToken(header: string | undefined): string {
  const [scheme, token] = header?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Bearer token is required");
  }
  return token;
}

export const updatePasswordController = asyncHandler(async (req, res) => {
  const input = UpdatePasswordSchema.parse(req.body);
  const token = bearerToken(req.header("authorization"));
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const repository = new AuthRepository();
  const session = await repository.findActiveSession(tokenHash);

  if (!session || !(await bcrypt.compare(input.currentPassword, session.user.password))) {
    throw new UnauthorizedError("Invalid credentials or expired session");
  }

  const password = await bcrypt.hash(input.newPassword, 12);
  await repository.updatePassword(session.user.id, password);
  res.status(200).json(apiResponse(null, "Password updated successfully"));
});
