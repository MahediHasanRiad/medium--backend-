import bcrypt from "bcrypt";
import { redis } from "../../config/redis";
import { sendEmail } from "../../shared/email/send-email";
import { uploadAvatar } from "../../shared/file-upload/avatar";
import { BadRequestError } from "../../shared/http/apiError";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { generateOtp } from "../../shared/otp/otp";
import AuthRepository from "../auth.repository";
import { CreateUserSchema } from "../auth.validation";

export const registerController = asyncHandler(async (req, res) => {
    
    const { email, password, username } = req.body;
    const avatar = req.file?.path ?? null;
    if (!avatar) {
        throw new BadRequestError('Avatar is required and must be a valid image file');
    }

    // upload in cloudinary
    const avatarUrl = await uploadAvatar(avatar);

    const payload = {
        email,
        password,
        username,
        avatarUrl: avatarUrl ?? null,
    }

    // input validation
    const validatedData = CreateUserSchema.parse(payload); 

    const authRepository = new AuthRepository();

    // create user
    await authRepository.createUser({
        ...validatedData,
        password: await bcrypt.hash(validatedData.password, 12),
        avatarUrl: avatarUrl
    });

    // send verification email
    const otp = generateOtp()
    await sendEmail(email, otp);

    // set in redis
    await redis.set(`registration:otp:${email}`, otp,  'EX', 300 );

    // res
    res.status(201).json({
        success: true,
        message: 'Send OTP',
    });
    
});
