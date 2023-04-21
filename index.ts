import { config as intEnv } from "dotenv";
intEnv();
import Database from "./database";
import ServerGrabber from "./server/data/serverGrabber";
import "./server/web"
import KeyManager from "./server/database/keyManager";

export const db = new Database(async () => {
    await KeyManager.instance.loadKeys();

    
    
});
export const serverGrabber = new ServerGrabber();