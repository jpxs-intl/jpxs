import Database from "../../database";
import { config } from "dotenv";
import Logger from "../../utils/logger";
import KeyManager from "../database/keyManager";
import { KeyPermsNames } from "../types/keyPerms";
import { User } from "../../database/entities/user.entity";

config();

const db = new Database();

// wait 5 seconds for the database to be ready

setTimeout(async () => {

    const res = await db.em.find(User, {
        avatarHistory: {
            avatar: {
                sex: 0,
                hairColor: 11,
                skin: 0
            }
        }
    })

    res
        .filter(user => user.phoneNumber.toString().startsWith("404"))
        .forEach(async user => {
            console.log(user.phoneNumber, await user.getName())
        })


}, 1000)