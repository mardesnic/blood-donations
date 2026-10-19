-- Phone calls from the call list are logged as communications too.
ALTER TYPE "CommunicationType" ADD VALUE 'CALL' BEFORE 'SMS';

-- A donor's latest contact.
CREATE INDEX "Communication_donorId_createdAt_idx" ON "Communication"("donorId", "createdAt");
