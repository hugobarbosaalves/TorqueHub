import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSync } from 'bcryptjs';
import pg from 'pg';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');

  const workshop = await prisma.workshop.upsert({
    where: { document: '12345678000100' },
    update: {},
    create: {
      name: 'Auto Center TorqueHub',
      document: '12345678000100',
      phone: '11999999999',
      email: 'contato@torquehub.com.br',
      address: 'Rua das Oficinas, 123 - São Paulo/SP',
    },
  });
  console.log(`  ✅ Workshop: ${workshop.name} (${workshop.id})`);

  const customer = await prisma.customer.upsert({
    where: { id: workshop.id + '-customer' }, // fallback — upsert por nome
    update: {},
    create: {
      workshopId: workshop.id,
      name: 'João Silva',
      document: '12345678901',
      phone: '11988888888',
      email: 'joao@email.com',
    },
  });
  console.log(`  ✅ Customer: ${customer.name} (${customer.id})`);

  const vehicle = await prisma.vehicle.create({
    data: {
      workshopId: workshop.id,
      customerId: customer.id,
      plate: 'ABC-1234',
      brand: 'Honda',
      model: 'Civic',
      year: 2022,
      color: 'Prata',
      mileage: 45000,
    },
  });
  console.log(`  ✅ Vehicle: ${vehicle.brand} ${vehicle.model} - ${vehicle.plate} (${vehicle.id})`);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@torquehub.com.br' },
    update: {},
    create: {
      workshopId: workshop.id,
      name: 'Admin TorqueHub',
      email: 'admin@torquehub.com.br',
      passwordHash: hashSync('admin123', 10),
      role: 'WORKSHOP_OWNER',
    },
  });
  console.log(`  ✅ User: ${adminUser.name} (${adminUser.email}) — role: ${adminUser.role}`);

  const platformAdmin = await prisma.user.upsert({
    where: { email: 'hugo@torquehub.com.br' },
    update: {},
    create: {
      workshopId: null,
      name: 'Hugo — Platform Admin',
      email: 'hugo@torquehub.com.br',
      passwordHash: hashSync('admin123', 10),
      role: 'PLATFORM_ADMIN',
    },
  });
  console.log(
    `  ✅ User: ${platformAdmin.name} (${platformAdmin.email}) — role: ${platformAdmin.role}`,
  );

  console.log('');
  console.log('📋 Seed data IDs (use these for API testing):');
  console.log(`   workshopId:  ${workshop.id}`);
  console.log(`   customerId:  ${customer.id}`);
  console.log(`   vehicleId:   ${vehicle.id}`);
  console.log(`   userId:      ${adminUser.id}`);
  console.log(`   platformId:  ${platformAdmin.id}`);
  console.log('   login owner: admin@torquehub.com.br / admin123');
  console.log('   login admin: hugo@torquehub.com.br / admin123');
  console.log('');
  console.log('🌱 Seeding complete!');

  await prisma.$disconnect();
  await pool.end();
}

await seed().catch((e: unknown) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
