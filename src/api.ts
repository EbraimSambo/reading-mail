import express from "express";
import { count, desc } from "drizzle-orm";
import { db, emailsTable } from "./db/index.js";

const app = express();
const PORT = process.env.PORT ?? "3007";

app.get("/api/emails", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );
    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ total: count() })
      .from(emailsTable);
    const total = totalResult[0]?.total ?? 0;

    const data = await db
      .select()
      .from(emailsTable)
      .orderBy(desc(emailsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Erro ao listar e-mails:", error);
    res.status(500).json({ error: "Erro interno ao listar e-mails" });
  }
});

export const server = app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
