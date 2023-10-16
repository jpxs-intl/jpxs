import Database from "../../database";
import { config } from "dotenv";
import Logger from "../../utils/logger";
import KeyManager from "../database/keyManager";
import { KeyPermsNames } from "../types/keyPerms";

config();

const db = new Database();

// wait 5 seconds for the database to be ready

setTimeout(async () => {

    await KeyManager.instance.loadKeys()

    const key = await KeyManager.instance.createKey("jpxs", ["135.148.137.113"], "PanelUtil key", "group", 3, true)

    Logger.log("KeyService", `Key created!\nKey: ${key.key}\nPerms: ${key.listPermissions().map((v) => KeyPermsNames[v]).join(", ")}`)  

}, 5000)