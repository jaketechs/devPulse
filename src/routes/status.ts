import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
import { desc } from "drizzle-orm";
import { db } from "../db/client";
import { metricsTable } from "../db/schema";
export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.get("/api/status", async (request, reply) => {
    const latest = await db
      .select()
      .from(metricsTable)
      .orderBy(desc(metricsTable.ts))
      .limit(1);
    return {
      http_ok: latest[0].http_ok,
    };
  });
}
