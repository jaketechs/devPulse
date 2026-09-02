import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
import { desc } from "drizzle-orm";
import { db } from "../db/client";
import { metricsTable } from "../db/schema";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get("/api//metrics/deploys", async (request, reply) => {const latest=await db 
    .select()
    .from(metricsTable)
    .orderBy(desc(metricsTable.ts))

    return{
      id:latest[0].id,
      ts:latest[0].ts,
      cpu_pct:latest[0].cpu_pct,
      mem_pct:latest[0].mem_pct,   
    }
   })
}