import crypto from "node:crypto";
import { UnauthorizedError } from "../../shared/http/apiError";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { apiResponse } from "../../shared/http/apiResponse";
import AuthRepository from "../auth.repository";

function bearerToken(header: string | undefined): string {
  const [scheme, token] = header?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) throw new UnauthorizedError("Bearer token is required");
  return token;
}

export const logoutController = asyncHandler(async (req, res) => {
  const token = bearerToken(req.header("authorization"));
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const result = await new AuthRepository().deleteSession(tokenHash);
  if (result.count === 0) throw new UnauthorizedError("Invalid or expired session");
  res.status(200).json(apiResponse(null, "Logout successful"));
});
