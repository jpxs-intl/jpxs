import { Entity, EntityRepositoryType, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import Id from '../../utils/id.js';
import { ServerRepository } from "../repositories/server.repository.js";
import { Snapshot } from "./snapshot.entity.js";
import Core from "../../server/core.js";

@Entity()
export class Server {

  [EntityRepositoryType]?: ServerRepository;

  @PrimaryKey()
  id: string = Id.get();

  @Property()
  address!: string;

  @Property()
  port!: number;

  @Property({
    columnType: "bigint",
  })
  identifier!: number;

  @Property({
    type: "text",
    nullable: true,
  })
  description?: string;

  @Property({
    nullable: true,
  })
  icon!: string;

  @Property({
    nullable: true,
  })
  link!: string;

  @Property({
    type: "json",
    nullable: true,
  })
  bans: {
    name: string;
    subRosaId: number;
  }[] = [];

  @OneToMany(() => Snapshot, snapshot => snapshot.server)
  snapshots: Snapshot[] = [];

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(data: {
    address: string;
    port: number;
    identifier: number;
  }) {
    this.address = data.address;
    this.port = data.port;
    this.identifier = data.identifier;
  }

  public async getName() {
    const snapshot = await Core.services.snapshot.findOne({
      server: this,
    }, {
      orderBy: {
        timestamp: "DESC",
      }
    })

    return snapshot?.name || "Unknown Server";
  }

}
