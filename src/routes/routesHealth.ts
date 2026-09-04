import { desc } from "drizzle-orm";
import { db } from "../db/client";
import { metricsTable,deploysTable } from "../db/schema";
import Fastify, { FastifyInstance,FastifyPluginOptions}from "fastify"
export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
fastify.get<{Params:{id:string}}>("/api/deploys/:id/health", async (request, reply) => {
  const { id } = request.params;
})}