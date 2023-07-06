import { db } from "../../index";
import { Punishment } from "../../database/entities/punishment.entity";
import { Server } from "../../database/entities/server.entity";
import { User } from "../../database/entities/user.entity";
import { PunishmentType } from "../types/punishmentType";
import CacheStorage from "./cacheStorage";

export type PermTime =
  | {
      isPermanent: boolean;
    }
  | {
      expiresAt: Date;
    };

export type SharedPunishmentData = {
  reason: string;
  user: number;
  serverId: string;
  createdBy: number;
};

export type TimedPunishment = {
  type:
    | PunishmentType.Ban
    | PunishmentType.GlobalBan
    | PunishmentType.IpBan
    | PunishmentType.Mute
    | PunishmentType.GlobalMute;
} & PermTime &
  SharedPunishmentData;

export type InstantPunishment = {
  type: PunishmentType.Kick | PunishmentType.Warning;
} & SharedPunishmentData;

export type PunishmentOptions = TimedPunishment | InstantPunishment;

export default class PunishmentManager {
  public static async createPunishment(options: PunishmentOptions) {
    const entity = new Punishment();

    entity.type = options.type;
    entity.reason = options.reason;
    entity.user = options.user;
    entity.server = (await CacheStorage.servers.get(options.serverId)) as Server;
    entity.createdBy = (await CacheStorage.users.get(options.createdBy)) as User;
    entity.createdAt = new Date();

    if ("expiresAt" in options) {
      entity.expiresAt = options.expiresAt;
    } else {
      entity.expiresAt = new Date(0);
    }

    await db.getEntityManager().persistAndFlush(entity);

  }
}
