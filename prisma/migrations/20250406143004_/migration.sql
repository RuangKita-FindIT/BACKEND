-- CreateEnum
CREATE TYPE "CommunityStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CommunityVisibility" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "GatheringStatus" AS ENUM ('planned', 'ongoing', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "accessibility_preferences_text_size" TEXT,
    "accessibility_preferences_high_contrast_enabled" BOOLEAN DEFAULT false,
    "language_preference" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Community" (
    "community_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "CommunityStatus" NOT NULL DEFAULT 'active',
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'public',
    "category_id" TEXT NOT NULL,
    "location" TEXT,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "active_member_count" INTEGER NOT NULL DEFAULT 0,
    "verified_status" BOOLEAN NOT NULL DEFAULT false,
    "sdg_tags" TEXT[],
    "accessibility_features" TEXT[],
    "language" TEXT,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("community_id")
);

-- CreateTable
CREATE TABLE "Post" (
    "post_id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "Reply" (
    "replies_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("replies_id")
);

-- CreateTable
CREATE TABLE "Gathering" (
    "gathering_id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "GatheringStatus" NOT NULL DEFAULT 'planned',
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "attendee_count" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "accessibility_info" TEXT,
    "virtual_meeting_url" TEXT,

    CONSTRAINT "Gathering_pkey" PRIMARY KEY ("gathering_id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "resource_id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("resource_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "PartnershipRequest" (
    "request_id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "umkm_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposed_partnership_type" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "submission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response_date" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "PartnershipRequest_pkey" PRIMARY KEY ("request_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community"("community_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community"("community_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gathering" ADD CONSTRAINT "Gathering_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community"("community_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community"("community_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipRequest" ADD CONSTRAINT "PartnershipRequest_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community"("community_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipRequest" ADD CONSTRAINT "PartnershipRequest_umkm_id_fkey" FOREIGN KEY ("umkm_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
