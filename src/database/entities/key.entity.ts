import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { KeyPerms, getPerms } from "../../server/types/keyPerms";

@Entity()
export class Key {
  @PrimaryKey()
  key!: string;

  @Property()
  ips: string[] = [];

  @Property()
  enabled: boolean = true;

  @Property()
  manuallyCreated: boolean = false;

  @Property({
    columnType: "bigint",
  })
  permissions: number = getPerms(1)

  @Property()
  owner: string = "";

  @Property()
  comment: string = "";

  @Property()
  createdAt: Date = new Date();

  @Property()
  lastUsed: Date = new Date(0);

  public hasPermission(permission: KeyPerms): boolean {
    return (this.permissions & permission) === permission;
  }

  public addPermission(permission: KeyPerms): void {
    this.permissions |= permission;
  }

  public removePermission(permission: KeyPerms): void {
    this.permissions &= ~permission;
  }

  public addIp(ip: string): void {
    this.ips.push(ip);
  }

  public removeIp(ip: string): void {
    this.ips = this.ips.filter((i) => i !== ip);
  }

  public listPermissions(): KeyPerms[] {
    const perms: KeyPerms[] = [];
    for (const perm in KeyPerms) {
      if (this.hasPermission(KeyPerms[perm as keyof typeof KeyPerms])) perms.push(KeyPerms[perm as keyof typeof KeyPerms]);
    }
    return perms;
  }

}
