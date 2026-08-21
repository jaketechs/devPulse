import 'dotenv/config'
import {drizzle} from 'drizzle-orm/node-postgres';
if(!process.env.DATABASE_URL){
    throw new Error("database is not set")
}
const db =drizzle({
    connection: {
        connectionString:process.env.DATABASE_URL!,
    }
})

