import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function routes(fastify:FastifyInstance,options:FastifyPluginOptions){
fastify.get("/api/status",async(request,reply)=>{return{}})
}