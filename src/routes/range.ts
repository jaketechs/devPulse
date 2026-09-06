import { gte, lte, and } from "drizzle-orm";
import { metricsTable } from "../db/schema";
import { db } from "../db/client";
import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.get<{ Querystring: { from: string; to: string } }>(
    "/api/metrics/range",
    async (request, reply) => {
      const { from, to } = request.query;
      if (from === undefined || to === undefined) {
        return reply
          .status(400)
          .send({ message: "from and to request are missing " });
      }
      const latest = await db
        .select()
        .from(metricsTable)
        .where(
          and(
            gte(metricsTable.ts, new Date(from)),
            lte(metricsTable.ts, new Date(to)),
          ),
        );

      return latest;
    },
  );
}
