import { EntityRepository } from "@mikro-orm/postgresql";
import { Player } from "../entities/player.entity.js";

export class PlayerRepository extends EntityRepository<Player> {

}