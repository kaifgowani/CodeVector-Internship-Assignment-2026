import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // need to install uuid

const prisma = new PrismaClient();

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports & Outdoors',
  'Toys & Games',
  'Beauty & Personal Care',
  'Health & Household',
  'Automotive',
  'Grocery',
];

const ADJECTIVES = ['Awesome', 'Sleek', 'Durable', 'Portable', 'Ergonomic', 'Premium', 'Eco-friendly', 'Compact', 'Vintage', 'Modern'];
const NOUNS = ['Gadget', 'Widget', 'Device', 'Tool', 'Accessory', 'Kit', 'Bundle', 'System', 'Machine', 'Gear'];

function generateRandomProduct() {
  const name = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)] as string;
  const price = (Math.random() * 1000 + 10).toFixed(2);
  
  // Spread created_at over the last 30 days
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  
  return {
    id: uuidv4(),
    name,
    category,
    price,
    createdAt: past,
    updatedAt: past,
  };
}

async function main() {
  console.log('Starting to seed 200,000 products...');
  const TOTAL_RECORDS = 200000;
  const BATCH_SIZE = 10000;
  
  const startTime = Date.now();

  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE; j++) {
      batch.push(generateRandomProduct());
    }

    await prisma.product.createMany({
      data: batch,
    });

    console.log(`Inserted ${i + BATCH_SIZE} / ${TOTAL_RECORDS} records...`);
  }

  const endTime = Date.now();
  console.log(`Seeding complete in ${(endTime - startTime) / 1000} seconds.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
