import Fastify from "fastify"
import { cekDb } from "./db/client"
import { startAgent } from "./agent"
import { routes } from "./routes/status"
async function mainFunction(){
    await cekDb()
    const app=Fastify()
    await app.register(routes)
    await app.listen({port:3000,host:"0.0.0.0"})
    console.log("api running on port 3000")
    startAgent()
}mainFunction()