import Database from "./database";
import ServerGrabber from "./server/serverGrabber";
import { config as intEnv } from "dotenv";

intEnv();

export const db = new Database();
export const serverGrabber = new ServerGrabber();

