import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { config } from "../config";
import { registerController } from "./controller/register.controller";
import { loginController } from "./controller/login.controller";
import { logoutController } from "./controller/logout.controller";
import { resendOTPController } from "./controller/resend-otp.controller";
import { verifyOtpController } from "./controller/verify-otp.controller";
import { updatePasswordController } from "./controller/update-password.controller";
import { forgotPasswordController } from "./controller/forgot-password.controller";
import { resetPasswordController } from "./controller/reset-password.controller";
import { upload } from "../middleware/multer.middleware";

const authRouter = Router();

const authRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: Math.min(config.rateLimitMax, 10),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication requests, please try again later.' },
});

authRouter.use(authRateLimiter);

authRouter.post('/register', upload.single('avatarUrl'), registerController);
authRouter.post('/login', loginController);
authRouter.post('/logout', logoutController);
authRouter.post('/resend-otp', resendOTPController);
authRouter.post('/verify-otp', verifyOtpController);
authRouter.patch('/update-password', updatePasswordController);
authRouter.post('/forgot-password', forgotPasswordController);
authRouter.post('/reset-password', resetPasswordController);

export default authRouter;
