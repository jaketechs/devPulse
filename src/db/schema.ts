
import { real,timestamp,integer, pgTable, varchar,boolean } from "drizzle-orm/pg-core";
export const metricsTable=pgTable("metrics",{
    id:integer().primaryKey().generatedAlwaysAsIdentity(),
    ts:timestamp('timestamp1').notNull().defaultNow(),
    cpu_pct:real(),
    mem_pct:real(),
    http_ok:boolean().default(true),
});