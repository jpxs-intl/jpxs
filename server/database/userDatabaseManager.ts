import { db } from "../..";
import { Avatar } from "../../database/entities/avatar.entity";
import { AvatarHistory } from "../../database/entities/avatarHistory.entity";
import { Ip } from "../../database/entities/ip.entity";
import { NameHistory } from "../../database/entities/nameHistory.entity";
import { User } from "../../database/entities/user.entity";
import Cache from "./cache/cache";
import UpdateableCache from "./cache/updateableCache";

export default class UserDatabaseManager {
  private _userCache: UpdateableCache<User, number>; // key: phoneNumber, value: User
  private _steamIdCache: Cache<number, string>; // key: steamId, value: phoneNumber
  private _gameIdCache: Cache<number, number>; // key: gameId, value: phoneNumber

  private static _instance: UserDatabaseManager;

  public static get instance(): UserDatabaseManager {
    if (!this._instance) {
      this._instance = new UserDatabaseManager();
    }
    return this._instance;
  }

  constructor() {
    this._gameIdCache = new Cache<number, number>("size", 100);
    this._steamIdCache = new Cache<number, string>("size", 100);

    this._userCache = new UpdateableCache<User, number>(
      async (key: number) => {
        const user = await db.getEntityManager().findOne(User, {
          phoneNumber: key,
        });

        if (user) {
          if (user.steamId) this._steamIdCache.set(user.steamId, user.phoneNumber);
          this._gameIdCache.set(user.gameId, user.phoneNumber);
          return user;
        }
        return undefined;
      },
      {
        prune: true,
        staleDataThreshold: 10,
      }
    );
  }

  public async getUser(phoneNumber: number): Promise<User | undefined> {
    return await this._userCache.getOrFetch(phoneNumber);
  }

  public async getUserBySteamId(steamId: string): Promise<User | undefined> {
    const phoneNumber = this._steamIdCache.get(steamId);
    if (phoneNumber) {
      return await this._userCache.getOrFetch(phoneNumber);
    }

    const user = await db.getEntityManager().findOne(User, {
      steamId: steamId,
    });

    if (user) {
      if (user.steamId) this._steamIdCache.set(user.steamId, user.phoneNumber);
      this._gameIdCache.set(user.gameId, user.phoneNumber);
      this._userCache.set(user.phoneNumber, user);
    }
    return user || undefined;
  }

  public async getUserByGameId(gameId: number): Promise<User | undefined> {
    const phoneNumber = this._gameIdCache.get(gameId);
    if (phoneNumber) {
      return await this._userCache.getOrFetch(phoneNumber);
    }

    const user = await db.getEntityManager().findOne(User, {
      gameId: gameId,
    });

    if (user) {
      if (user.steamId) this._steamIdCache.set(user.steamId, user.phoneNumber);
      this._gameIdCache.set(user.gameId, user.phoneNumber);
      this._userCache.set(user.phoneNumber, user);
    }
    return user || undefined;
  }

  public async createUser(
    user: User,
    data: {
      name?: string;
      avatar?: Avatar;
      ip?: string;
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

    this._userCache.set(user.phoneNumber, user);
    if (user.steamId) this._steamIdCache.set(user.steamId, user.phoneNumber);
    this._gameIdCache.set(user.gameId, user.phoneNumber);
    return user;
  }

  public async updateUser(user: User): Promise<User> {
    await db.getEntityManager().persistAndFlush(user);
    this._userCache.set(user.phoneNumber, user);
    if (user.steamId) this._steamIdCache.set(user.steamId, user.phoneNumber);
    this._gameIdCache.set(user.gameId, user.phoneNumber);
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
        alts = await Promise.all(ips.flatMap(async (ip) => {
          if (!ip.users.isInitialized()) await ip.users.init();
          return ip.users.getItems();
        })).then((users) => users.flat());
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

  public async catchIp(user: User, ip: string): Promise<void> {
    const ipEntity = await db.getEntityManager().findOne(Ip, {
      ip: ip,
    });

    if (ipEntity) {
      if (!ipEntity.users.isInitialized()) await ipEntity.users.init();

      if (ipEntity.users.contains(user)) return;
      ipEntity.users.add(user);
      await db.getEntityManager().persistAndFlush(ipEntity);
    } else {
      const newIp = new Ip();
      newIp.ip = ip;
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
}
