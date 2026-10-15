import { prisma } from "../lib/prisma";
import { CreateUserInput, User } from "./auth.validation";

class AuthRepository {
  constructor() {}

  async createUser(user: CreateUserInput): Promise<User> {
    try {
      const { email, password, username, avatarUrl } = user;
      const newUser = await prisma.user.create({
        data: {
          email,
          password,
          username,
          avatarUrl: avatarUrl,
        },
      });
      return newUser as User;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async markUserVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  async createSession(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.session.create({
      data: { userId, tokenHash, expiresAt },
      select: { id: true, expiresAt: true },
    });
  }

  async deleteSession(tokenHash: string) {
    return prisma.session.deleteMany({ where: { tokenHash } });
  }

  async findActiveSession(tokenHash: string) {
    return prisma.session.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      select: {
        user: { select: { id: true, password: true } },
      },
    });
  }

  async updatePassword(userId: string, password: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password },
    });
  }

  async resetPassword(userId: string, password: string) {
    return prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: userId },
        data: { password },
      });
      await transaction.session.deleteMany({ where: { userId } });
    });
  }
}

export default AuthRepository;
