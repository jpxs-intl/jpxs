import { Entity, EntityRepositoryType, PrimaryKey, Property } from "@mikro-orm/core";
import Id from '../../../utils/id.js';
import { ServerRepository } from "../repositories/server.repository.js";

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

}
