import { config as intEnv } from "dotenv";
intEnv();
import Database from "./database";
import ServerGrabber from "./server/serverGrabber";
import "./server/web"



export const db = new Database();
export const serverGrabber = new ServerGrabber();

