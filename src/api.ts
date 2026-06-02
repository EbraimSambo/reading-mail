import express from 'express';
import { dbClient, usersTable } from './drizzle.schema.js';
import { count, desc } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3007;

app.get('/api/emails', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    const totalResult = await dbClient.select({ total: count() }).from(usersTable);
    const total = totalResult[0]?.total ?? 0;

    const data = await dbClient
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar emails:', error);
    res.status(500).json({ error: 'Erro interno ao listar emails' });
  }
});

export const server = app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
