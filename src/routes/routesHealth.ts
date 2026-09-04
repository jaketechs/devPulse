import { desc,eq,lt,gt} from "drizzle-orm";
import { db } from "../db/client";
import { metricsTable,deploysTable } from "../db/schema";
import Fastify, { FastifyInstance,FastifyPluginOptions}from "fastify"
export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
fastify.get<{Params:{id:string}}>("/api/deploys/:id/health", async (request, reply) => {
  const { id } = request.params;
  const targetDeploy=await db
  .select().from(deploysTable).where(eq(deploysTable.id,parseInt(id)))
  const deployTs = targetDeploy[0].ts;
  const beforeMetric=await db.select().from(metricsTable).where(lt(metricsTable.ts,deployTs))
  const afterMetric=await db.select().from(metricsTable).where(gt(metricsTable.ts,deployTs))
  const totalCpuBefore=beforeMetric.reduce((sum,row)=>sum+(row.cpu_pct?? 0),0);
  const averageCpuBefore=totalCpuBefore/beforeMetric.length;
  const totalCpuAfter=afterMetric.reduce((sum,row)=>sum+(row.cpu_pct??0),0);
  const averageCpuAfter=totalCpuAfter/afterMetric.length;
  const totalMemoryBefore=beforeMetric.reduce((sum,row)=>sum+(row.mem_pct??0),0);
  const averageMemoryBefore=totalMemoryBefore/beforeMetric.length;
  const totalMemAfter=afterMetric.reduce((sum,row)=>sum+(row.mem_pct??0),0)
  const averageMemAfter=totalMemAfter/afterMetric.length
  let verdict="healthy"
  if(averageCpuAfter>averageCpuBefore){verdict="degraded"}
  if(averageMemAfter>averageMemoryBefore){verdict="degraded"}
  const goesDown=afterMetric.some(row=>!row.http_ok)
  if(goesDown){verdict="degraded"}
  return{verdict,averageCpuBefore,averageCpuAfter,averageMemoryBefore,averageMemAfter}
})}
