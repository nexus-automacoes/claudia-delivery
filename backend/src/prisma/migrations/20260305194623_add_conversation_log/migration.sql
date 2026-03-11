-- CreateTable
CREATE TABLE "ConversationLog" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "botResponse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationLog_phone_idx" ON "ConversationLog"("phone");

-- CreateIndex
CREATE INDEX "ConversationLog_createdAt_idx" ON "ConversationLog"("createdAt");
