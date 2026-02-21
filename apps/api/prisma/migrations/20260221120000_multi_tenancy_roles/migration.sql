-- Multi-Tenancy: Renomear roles e tornar workshopId nullable
-- ADMIN → WORKSHOP_OWNER, adicionar PLATFORM_ADMIN
-- Estratégia: recriar enum (ADD VALUE não pode ser usado na mesma transação que UPDATE)

-- 1. Criar novo enum com os valores corretos
CREATE TYPE "user_role_new" AS ENUM ('PLATFORM_ADMIN', 'WORKSHOP_OWNER', 'MECHANIC');

-- 2. Remover default antes de alterar tipo
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- 3. Converter coluna para TEXT temporariamente
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;

-- 4. Migrar dados existentes: ADMIN → WORKSHOP_OWNER
UPDATE "users" SET "role" = 'WORKSHOP_OWNER' WHERE "role" = 'ADMIN';

-- 5. Converter coluna para o novo enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role_new" USING "role"::"user_role_new";

-- 6. Remover enum antigo e renomear o novo
DROP TYPE "user_role";
ALTER TYPE "user_role_new" RENAME TO "user_role";

-- 7. Restaurar default
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MECHANIC'::"user_role";

-- 8. Tornar workshop_id nullable (para PLATFORM_ADMIN)
ALTER TABLE "users" ALTER COLUMN "workshop_id" DROP NOT NULL;

-- 9. Atualizar FK para ON DELETE SET NULL (campo agora nullable)
ALTER TABLE "users" DROP CONSTRAINT "users_workshop_id_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
