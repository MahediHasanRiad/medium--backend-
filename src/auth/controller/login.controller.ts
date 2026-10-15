import bcrypt from "bcrypt";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { apiResponse } from "../../shared/http/apiResponse";
import { UnauthorizedError } from "../../shared/http/apiError";
import AuthRepository from "../auth.repository";
import { LoginSchema } from "../auth.validation";
import crypto from "node:crypto";

const SESSION_TTL_SECONDS = 60 * 15;

export const loginController = asyncHandler(async (req, res) => {
  const input = LoginSchema.parse(req.body);
  const repository = new AuthRepository();
  const user = await repository.findUserByEmail(input.email);

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new UnauthorizedError("Invalid email or password");
  }
  if (!user.isVerified) {
    throw new UnauthorizedError("Please verify your email before logging in");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await repository.createSession(user.id, tokenHash, expiresAt);

  const response = {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    token,
    expiresAt,
  };

  res.status(200).json(apiResponse(response, "Login successful"));
});
