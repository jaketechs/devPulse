import 'dotenv/config'
import {sql} from "drizzle-orm"
import {drizzle} from 'drizzle-orm/node-postgres';



if(!process.env.DATABASE_URL){
    throw new Error("database is not set")
}
export const db =drizzle({
    connection: {
        connectionString:process.env.DATABASE_URL!,
    }
})
export async function cekDb() {
    const result = await db.execute(sql `select 1`)
    console.log ('database connected') 
}
