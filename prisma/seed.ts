import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed API key
  await prisma.settings.upsert({
    where: { key: 'turboviplay_api_key' },
    create: { key: 'turboviplay_api_key', value: '0iHhFGzTW4' },
    update: { value: '0iHhFGzTW4' }
  });
  
  console.log('✅ API key seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
