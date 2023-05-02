import { config as intEnv } from "dotenv";
intEnv();
import Database from "./database";
import ServerGrabber from "./server/data/serverGrabber";
import "./server/web"
import KeyManager from "./server/database/keyManager";
import { User } from "./database/entities/user.entity";
import fs from "fs";

export const db = new Database(async () => {
    await KeyManager.instance.loadKeys();

    // get users with more than 3 IPs
    
   const userIps: { 
         userId: number,
            ips: string[]
   }[] = []

   const ips = db.getEntityManager().getRepository(User).find({}).then((users) => {

        users.forEach(async (user) => {
            if (!user.ips.isInitialized()) await user.ips.init()
            if (user.ips.length > 3) {
                userIps.push({
                    userId: user.phoneNumber,
                    ips: user.ips.toArray().map((ip) => ip.ip)
                })
            }
        })

   })
    
   fs.writeFileSync("./userIps.json", JSON.stringify(userIps, null, 4))
    
});
export const serverGrabber = new ServerGrabber();