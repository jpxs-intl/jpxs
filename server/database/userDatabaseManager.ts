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

  public async createUser(user: User): Promise<User> {
    await db.getEntityManager().persistAndFlush(user);
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

    let alts: User[] = [];

    db.getEntityManager()
      .find(Ip, {
        ip: {
          $in: user.ips.getItems().map((ip) => ip.ip),
        },
      })
      .then((ips) => {
        alts = ips.flatMap((ip) => ip.users.getItems());
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
      const nameHistory = new NameHistory();
      nameHistory.name = name;
      nameHistory.player = user;
      nameHistory.date = new Date();
      await db.getEntityManager().persistAndFlush(nameHistory);
    }
  }

  public async catchIp(user: User, ip: string): Promise<void> {
    const ipEntity = await db.getEntityManager().findOne(Ip, {
      ip: ip,
    });

    if (ipEntity) {
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
      const avatarHistory = new AvatarHistory();
      avatarHistory.avatar = avatar;
      avatarHistory.player = user;
      avatarHistory.date = new Date();
      await db.getEntityManager().persistAndFlush(avatarHistory);
    }
  }
}
