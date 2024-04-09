import { EntityRepository } from "@mikro-orm/postgresql";
import { Server } from "../entities/server.entity.js";

export class ServerRepository extends EntityRepository<Server> {

}