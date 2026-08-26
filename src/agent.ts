import { getMetrics } from "./metrics";
import { setTimeout } from "node:timers/promises";
import { metricsTable } from "./db/schema";
import { db } from "./db/client";

const SERVICE_URL = "https://example.com";

async function pingService(url:string):Promise<boolean>{
  try{
    const response = await fetch (url,{method:"HEAD"})
    return response.ok;
  }catch(error){
    return false;
  }
}
export async function startAgent(){
  while(true){
    try{
  const metrics=await getMetrics()
  const isItOK=await pingService(SERVICE_URL)
  await db.insert(metricsTable).values({
    cpu_pct:await metrics.cpuLoad,
    mem_pct:await metrics.memPercent,
    http_ok:await isItOK
  })
  console.log(`[${new Date().toISOString()}] Metrics stored. HTTP Status: ${isItOK}`);
    }catch(error){
      console.error("error during execution loop:",error);
    }await setTimeout(3000)}
  }
// agent.ts
// 1. Import getMetrics from metrics.ts
// 2. Every 30 seconds:
//    a. Call getMetrics() to get CPU, memory data
//    b. Ping the service URL to check http_ok
//    c. Insert all data into PostgreSQL metrics table
// 3. Run forever until process is stopped
// 4. Data sits in PostgreSQL waiting for API to serve it