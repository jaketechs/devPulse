import { deploysTable, metricsTable } from "../db/schema";
import { db } from "../db/client";
import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions){
    fastify.post<{Body:{commit_sha:string;branch:string;status:string }}>("/api/deploys/webhook",async(request,reply)=>{
        const {commit_sha,branch,status}=request.body;
        await db.insert(deploysTable).values({commit_sha,branch,status});
        return{message:"deploy succesful"};
    })
}
