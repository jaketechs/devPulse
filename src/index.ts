import Fastify from "fastify"
import { cekDb } from "./db/client"
import { startAgent } from "./agent"
import { routes as routesStatus } from "./routes/status"
import{routes as routesMetrics}from "./routes/metrics"
import {routes as routesRange}from "./routes/range"
async function mainFunction(){
    await cekDb()
    const app=Fastify()
    await app.register(routesStatus)
    await app.register(routesMetrics)
    await app.register(routesRange)
    await app.listen({port:3000,host:"0.0.0.0"})
    console.log("api running on port 3000")
    startAgent()
 
}mainFunction()