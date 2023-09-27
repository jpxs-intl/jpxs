import { db } from "../..";
import { BannedUser } from "../../database/entities/bannedUser.entity";
import { Ip } from "../../database/entities/ip.entity";

export default class Banlist {
  public static list: string[] = [];

  public static async init() {
    const bans = await db.em.find(BannedUser, {});

    await Promise.all(
      bans.map(async (ban) => {
        Banlist.list.push(
          ...(await db.em
            .find(Ip, {
              users: {
                phoneNumber: ban.phoneNumber,
              },
            })
            .then((ips) => {
              return ips.map((ip) => ip.ip);
            }))
        );
      })
    );
  }
}
