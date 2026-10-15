-- Expand the initial User table to match the Prisma schema.
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "User"
  ADD COLUMN "username" TEXT,
  ADD COLUMN "password" TEXT,
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
  ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "displayName" TEXT,
  ADD COLUMN "bio" TEXT,
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "address" TEXT;

ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_createdAt_email_id_username_idx" ON "User"("createdAt", "email", "id", "username");

CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "PublicationRole" AS ENUM ('OWNER', 'EDITOR', 'WRITER');
CREATE TYPE "NotificationType" AS ENUM ('FOLLOW', 'CLAP', 'COMMENT', 'REPLY', 'ARTICLE_PUBLISHED');
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'PAST_DUE');
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PREMIUM', 'ENTERPRISE');

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Publication" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "description" TEXT,
  "logoUrl" TEXT,
  "coverUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Article" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "publicationId" TEXT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "subtitle" TEXT,
  "content" TEXT NOT NULL,
  "excerpt" TEXT,
  "coverImage" TEXT,
  "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArticleTag" (
  "articleId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("articleId", "tagId")
);

CREATE TABLE "Comment" (
  "id" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "parentId" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Like" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Bookmark" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Follow" (
  "id" TEXT NOT NULL,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PublicationMember" (
  "id" TEXT NOT NULL,
  "publicationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "PublicationRole" NOT NULL DEFAULT 'WRITER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicationMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" "NotificationType" NOT NULL,
  "articleId" TEXT,
  "commentId" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArticleView" (
  "id" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "userId" TEXT,
  "ipHash" TEXT,
  "userAgent" TEXT,
  "readTime" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArticleView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" TEXT,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" TIMESTAMP(3),
  "autoRenew" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plans" (
  "id" TEXT NOT NULL,
  "name" "SubscriptionPlan" NOT NULL,
  "description" TEXT,
  "monthlyRegularPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "monthlyDiscountedPrice" DECIMAL(10,2),
  "yearlyRegularPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "yearlyDiscountedPrice" DECIMAL(10,2),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plan_features" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");
CREATE INDEX "Article_publicationId_idx" ON "Article"("publicationId");
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX "ArticleTag_tagId_idx" ON "ArticleTag"("tagId");
CREATE INDEX "Comment_articleId_createdAt_idx" ON "Comment"("articleId", "createdAt");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "Like_articleId_idx" ON "Like"("articleId");
CREATE UNIQUE INDEX "Like_userId_articleId_key" ON "Like"("userId", "articleId");
CREATE INDEX "Bookmark_articleId_idx" ON "Bookmark"("articleId");
CREATE UNIQUE INDEX "Bookmark_userId_articleId_key" ON "Bookmark"("userId", "articleId");
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
CREATE UNIQUE INDEX "Publication_slug_key" ON "Publication"("slug");
CREATE INDEX "PublicationMember_userId_idx" ON "PublicationMember"("userId");
CREATE UNIQUE INDEX "PublicationMember_publicationId_userId_key" ON "PublicationMember"("publicationId", "userId");
CREATE INDEX "Notification_recipientId_isRead_createdAt_idx" ON "Notification"("recipientId", "isRead", "createdAt");
CREATE INDEX "Notification_actorId_idx" ON "Notification"("actorId");
CREATE INDEX "ArticleView_articleId_createdAt_idx" ON "ArticleView"("articleId", "createdAt");
CREATE INDEX "ArticleView_userId_idx" ON "ArticleView"("userId");
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");
CREATE UNIQUE INDEX "plan_features_planId_key" ON "plan_features"("planId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicationMember" ADD CONSTRAINT "PublicationMember_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicationMember" ADD CONSTRAINT "PublicationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArticleView" ADD CONSTRAINT "ArticleView_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleView" ADD CONSTRAINT "ArticleView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
