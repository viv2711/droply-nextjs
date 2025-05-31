import { migrate } from "drizzle-orm/neon-http/migrator"
import {drizzle} from "drizzle-orm/neon-http"
import {neon} from "@neondatabase/serverless"
import * as dotenv from "dotenv"

dotenv.config({path: ".env.local"}) 
if(!process.env.DATABASE_URL){
    throw new Error("Databse url is not set in .env.local")
}

async function runMigration(){
    try {
        const sql = neon(process.env.DATABASE_URL!)
        const db = drizzle(sql)
        console.log(db)
        await migrate(db, {migrationsFolder: "./drizzle"})
        console.log("All migrations are successfull done")

    } catch (error) {
        console.log("There is some error during migration")
        console.log("Error", error)
        process.exit(1);
    }
}

runMigration()
