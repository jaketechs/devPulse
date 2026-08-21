import { getMetrics } from "./metrics"
import 'dotenv/config';
import {drizzle} from 'drizzle-orm/node-postgres';
if(!process.env.DATABASE_URL){
    throw new Error("database is not set yet")
}
const db = drizzle(process.env.DATABASE_URL);

async function runGetMetrics(){
const metrics= await getMetrics()
console.log(metrics)
}
    runGetMetrics()

