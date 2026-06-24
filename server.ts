import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient, Prisma } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Interface for decoding our cursor
interface CursorData {
  createdAt: string;
  id: string;
}

app.get('/api/products', async (req, res) => {
  try {
    const { category, cursor, limit = '20' } = req.query;
    const take = parseInt(limit as string, 10);
    
    // We fetch one extra item to check if there is a next page
    const takeWithNextPage = take + 1;

    let decodedCursor: CursorData | null = null;
    if (cursor) {
      const cursorString = Buffer.from(cursor as string, 'base64').toString('utf-8');
      const [createdAtStr, idStr] = cursorString.split(',');
      if (createdAtStr && idStr) {
        decodedCursor = { createdAt: createdAtStr, id: idStr };
      }
    }

    // Build the query
    // Prisma doesn't natively support tuple comparisons like `(createdAt, id) < (cursor.createdAt, cursor.id)` directly in a simple object syntax for all cases,
    // but we can use OR conditions to simulate it for descending order.
    // Condition for DESC:
    // (createdAt < cursor.createdAt) OR (createdAt == cursor.createdAt AND id < cursor.id)
    
    let whereClause: Prisma.ProductWhereInput = {};
    
    if (category) {
      whereClause.category = category as string;
    }

    if (decodedCursor) {
      const cursorDate = new Date(decodedCursor.createdAt);
      
      whereClause.OR = [
        {
          createdAt: {
            lt: cursorDate
          }
        },
        {
          createdAt: {
            equals: cursorDate
          },
          id: {
            lt: decodedCursor.id
          }
        }
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: takeWithNextPage,
    });

    let nextCursor: string | null = null;
    
    // If we got more products than requested `take`, it means there is a next page
    if (products.length > take) {
      const nextItem = products[take - 1]; // The last item of the current page
      nextCursor = Buffer.from(`${nextItem.createdAt.toISOString()},${nextItem.id}`).toString('base64');
      products.pop(); // Remove the extra item used for looking ahead
    } else if (products.length > 0) {
      // It's the last page, no next cursor
      nextCursor = null;
    }

    res.json({
      data: products,
      nextCursor
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
