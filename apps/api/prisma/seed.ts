import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
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

  console.log('');
  console.log('📋 Seed data IDs (use these for API testing):');
  console.log(`   workshopId:  ${workshop.id}`);
  console.log(`   customerId:  ${customer.id}`);
  console.log(`   vehicleId:   ${vehicle.id}`);
  console.log('');
  console.log('🌱 Seeding complete!');

  await prisma.$disconnect();
  await pool.end();
}

await seed().catch((e: unknown) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
