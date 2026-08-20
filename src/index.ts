import { getMetrics } from "./metrics"
async function runGetMetrics(){
const metrics= await getMetrics()
console.log(metrics)
}
    runGetMetrics()

