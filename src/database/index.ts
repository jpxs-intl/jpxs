import { MikroORM, PostgreSqlDriver, EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import Logger from "../utils/logger.js";
import { DatabaseChannel } from "../server/messaging/channels/database.js";
import { Avatar } from "./entities/avatar.entity.js";
import { AvatarHistory } from "./entities/avatarHistory.entity.js";
import { Player } from "./entities/player.entity.js";
import { Server } from "./entities/server.entity.js";
import { GameSession } from "./entities/session.entity.js";
import { Key } from "./entities/key.entity.js";
import { Tag } from "./entities/tag.entity.js";
import { PlayerRepository } from "./repositories/player.repository.js";
import { ServerRepository } from "./repositories/server.repository.js";
import { Chat } from "./entities/chat.entity.js";
import { Finance } from "./entities/finance.entity.js";
import { AuthSession } from "./entities/authSession.entity.js";
import { Ip } from "./entities/ip.entity.js";
import { NameHistory } from "./entities/nameHistory.entity.js";
import { Snapshot } from "./entities/snapshot.entity.js";
import Storage from "./entities/storage.entity.js";
import { User } from "./entities/user.entity.js";
import { UserAuth } from "./entities/userAuth.entity.js";

let instance: Database;

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  authSession: EntityRepository<AuthSession>
  avatar: EntityRepository<Avatar>
  avatarHistory: EntityRepository<AvatarHistory>
  chat: EntityRepository<Chat>
  finance: EntityRepository<Finance>
  ip: EntityRepository<Ip>
  key: EntityRepository<Key>
  nameHistory: EntityRepository<NameHistory>
  player: PlayerRepository
  server: ServerRepository
  session: EntityRepository<GameSession>
  snapshot: EntityRepository<Snapshot>
  storage: EntityRepository<Storage>
  tag: EntityRepository<Tag>
  user: EntityRepository<User>
  userAuth: EntityRepository<UserAuth>
}

let services: Services;
export default class Database {
  public readonly clientid = "jpxs.database";

  private orm!: MikroORM;

  constructor() {
    if (instance) {
      return instance;
    }

    instance = this;
  }

  public async init(): Promise<Services> {
    const orm = await MikroORM.init<PostgreSqlDriver>({
      entities: [
        AuthSession,
        Avatar,
        AvatarHistory,
        Chat,
        Finance,
        GameSession,
        Ip,
        Key,
        NameHistory,
        Player,
        Server,
        Storage,
        Tag,
        User,
        UserAuth
      ],
      driver: PostgreSqlDriver,
      preferTs: true,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      dbName: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      metadataProvider: TsMorphMetadataProvider,
      debug: process.env.DEBUG === "true" && process.env.DATABASE_DEBUG === "true",
    }).catch((err) => {
      Logger.error("Database", "Failed to initialize database");
      Logger.error("Database", err);
      console.error(err);
      process.exit(1);
    });

    Logger.info("Database", "Database initialized");
    DatabaseChannel.publish(this.clientid, "database:initialized", {});

    const em = orm.em.fork();

    services = {
      orm,
      em,
      authSession: em.getRepository(AuthSession),
      avatar: em.getRepository(Avatar),
      avatarHistory: em.getRepository(AvatarHistory),
      chat: em.getRepository(Chat),
      finance: em.getRepository(Finance),
      key: em.getRepository(Key),
      ip: em.getRepository(Ip),
      nameHistory: em.getRepository(NameHistory),
      player: em.getRepository(Player),
      server: em.getRepository(Server),
      session: em.getRepository(GameSession),
      snapshot: em.getRepository(Snapshot),
      storage: em.getRepository(Storage),
      tag: em.getRepository(Tag),
      user: em.getRepository(User),
      userAuth: em.getRepository(UserAuth),

    };

    this.orm = orm;

    return services;
  }

  public async close(): Promise<void> {
    await this.orm.close(true);
  }

  public get isReady(): boolean {
    return !!this.orm;
  }
}