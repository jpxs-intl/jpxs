import { db } from "..";
import { Server } from "../database/entities/server.entity";

export default class ServerDatabaseManager {
  public static async getServer(address: string, port: number, identifier: number) {
    return await db.getEntityManager().findOne(Server, { address, port, identifier });
  }
}
