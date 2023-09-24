import { db } from "../../index";
import { Avatar } from "../../database/entities/avatar.entity";
import { AvatarHistory } from "../../database/entities/avatarHistory.entity";
import { Ip } from "../../database/entities/ip.entity";
import { NameHistory } from "../../database/entities/nameHistory.entity";
import { User } from "../../database/entities/user.entity";
import { RequiredIpData } from "../types/vpn";
import CacheStorage from "./cacheStorage";

export default class UserDatabaseManager {
  private static _instance: UserDatabaseManager;

  public static get instance(): UserDatabaseManager {
    if (!this._instance) {
      this._instance = new UserDatabaseManager();
    }
    return this._instance;
  }

  public async getUser(phoneNumber: number): Promise<User | undefined> {
    return await CacheStorage.users.get(phoneNumber);
  }

  public async getUserBySteamId(steamId: string): Promise<User | undefined> {
    return await CacheStorage.steamIdMap.get(steamId).then(async (phoneNumber) => {
      if (phoneNumber) {
        return await CacheStorage.users.get(phoneNumber);
      }
      return undefined;
    });
  }

  public async getUserByGameId(gameId: number): Promise<User | undefined> {
    return await CacheStorage.gameIdMap.get(gameId).then(async (phoneNumber) => {
      if (phoneNumber) {
        return await CacheStorage.users.get(phoneNumber);
      }
      return undefined;
    });
  }

  public async createUser(
    user: User,
    data: {
      name?: string;
      avatar?: Avatar;
      ip?: RequiredIpData & { ip: string };
    }
  ): Promise<User> {
    await db.getEntityManager().persistAndFlush(user);

    if (data.name) {
      UserDatabaseManager.instance.catchName(user, data.name);
    }

    if (data.ip) {
      UserDatabaseManager.instance.catchIp(user, data.ip);
    }

    if (data.avatar) {
      UserDatabaseManager.instance.catchAvatar(user, data.avatar);
    }

    if (!user.nameHistory.isInitialized()) await user.nameHistory.init(); 
    if (!user.avatarHistory.isInitialized()) await user.avatarHistory.init();

    CacheStorage.users.set(user.phoneNumber, user);
    CacheStorage.gameIdMap.set(user.gameId, user.phoneNumber);
    if (user.steamId) CacheStorage.steamIdMap.set(user.steamId, user.phoneNumber);

    return user;
  }

  public async updateUser(user: User): Promise<User> {
    await db.getEntityManager().persistAndFlush(user);

    CacheStorage.users.set(user.phoneNumber, user);
    CacheStorage.gameIdMap.set(user.gameId, user.phoneNumber);
    if (user.steamId) CacheStorage.steamIdMap.set(user.steamId, user.phoneNumber);
    return user;
  }

  public async getAlts(phoneNumber: number): Promise<User[]> {
    const user = await this.getUser(phoneNumber);
    if (!user) return [];

    if (!user.ips.isInitialized()) await user.ips.init();

    let alts: User[] = [];

    db.getEntityManager()
      .find(Ip, {
        ip: {
          $in: user.ips.getItems().map((ip) => ip.ip),
        },
      })
      .then(async (ips) => {
        alts = await Promise.all(
          ips.flatMap(async (ip) => {
            if (!ip.users.isInitialized()) await ip.users.init();
            return ip.users.getItems();
          })
        ).then((users) => users.flat());
      });

    return alts;
  }

  public async catchName(user: User, name: string): Promise<void> {
    const mostRecentName = await db.getEntityManager().findOne(
      NameHistory,
      {
        player: user,
      },
      {
        orderBy: {
          date: "DESC",
        },
      }
    );

    if (!mostRecentName || mostRecentName.name !== name) {
      if (!user.nameHistory.isInitialized()) await user.nameHistory.init();

      user.nameHistory.add(new NameHistory(name, user));

      await db.getEntityManager().persistAndFlush(user);
    }
  }

  public async catchIp(user: User, ip: RequiredIpData & { ip: string }): Promise<void> {
    const ipEntity = await db.getEntityManager().findOne(Ip, {
      ip: ip.ip,
    });

    const latitude = parseFloat(ip.location.latitude);
    const longitude = parseFloat(ip.location.longitude);

    if (ipEntity) {
      if (!ipEntity.users.isInitialized()) await ipEntity.users.init();
      if (ipEntity.users.contains(user)) return;
      ipEntity.users.add(user);

      if (latitude || (latitude != ipEntity.latitude && latitude)) ipEntity.latitude = latitude;
      if (longitude || (longitude != ipEntity.longitude && longitude)) ipEntity.longitude = longitude;

      ipEntity.lastUsed = new Date();
      ipEntity.country = ip.location.country;
      ipEntity.countryCode = ip.location.country_code;
      ipEntity.isProxy = ip.security.proxy;
      ipEntity.isVpn = ip.security.vpn;
      ipEntity.timeZone = ip.location.time_zone;

      await db.getEntityManager().persistAndFlush(ipEntity);
    } else {
      const newIp = new Ip();
      newIp.ip = ip.ip;
      newIp.latitude = latitude || 0;
      newIp.longitude = longitude || 0;
      newIp.users.add(user);
      await db.getEntityManager().persistAndFlush(newIp);
    }
  }

  public async catchAvatar(user: User, avatar: Avatar): Promise<void> {
    const mostRecentAvatar = await db.getEntityManager().findOne(
      AvatarHistory,
      {
        player: user,
      },
      {
        orderBy: {
          date: "DESC",
        },
      }
    );

    if (!mostRecentAvatar || mostRecentAvatar.avatar !== avatar) {
      const avatarHistory = new AvatarHistory(avatar, user);
      await db.getEntityManager().persistAndFlush(avatarHistory);
    }
  }

  public async getUsersByLatestIp(ip: string): Promise<User[]> {
    const ipEntity = await db.getEntityManager().findOne(Ip, {
      ip,
    });

    if (!ipEntity) return [];

    if (!ipEntity.users.isInitialized()) await ipEntity.users.init();

    return ipEntity.users.getItems();
  }

  public async getUserIps(user: { phoneNumber: number } | number): Promise<Ip[]> {
    const phoneNumber = typeof user === "number" ? user : user.phoneNumber;

    const ips: Ip[] = await db.getEntityManager().find(Ip, {
      users: {
        phoneNumber,
      },
    });

    return ips;
  }
}
