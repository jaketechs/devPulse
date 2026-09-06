import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
import { desc } from "drizzle-orm";
import { db } from "../db/client";
import { deploysTable } from "../db/schema";
export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.get("/api/deploys", async (request, reply) => {
    const latest = await db
      .select()
      .from(deploysTable)
      .orderBy(desc(deploysTable.ts));
    return latest;
  });
}
