import { getMetrics } from "./metrics"
import {startAgent} from "./agent"
import {startApi}from "./api"
import{cekDb} from "./db/client"
import { db } from "./db/client"
import { metricsTable } from "./db/schema"
startAgent()
async function mainFunction(){
await cekDb()
const metrics = await getMetrics()
console.log(metrics)

//insert metrics
await db.insert(metricsTable).values({
    cpu_pct:metrics.cpuLoad,
    mem_pct:metrics.memPercent

})
}

    mainFunction()
    

