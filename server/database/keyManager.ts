import { db } from "../..";
import { Key } from "../../database/entities/key.entity";
import Util from "../../utils/util";
import { getPerms } from "../types/keyPerms";
import { KeyPermsLevels } from "../types/keyPerms";

export default class KeyManager {
  private _keys: Map<string, Key> = new Map<string, Key>();

  private static _instance: KeyManager;

  public static get instance(): KeyManager {
    if (!this._instance) {
      this._instance = new KeyManager();
    }
    return this._instance;
  }

  public async loadKeys(): Promise<void> {
    const keys = await db.getEntityManager().find(Key, {});
    keys.forEach((key) => {
      this._keys.set(key.key, key);
    });
  }

  public async getKey(key: string): Promise<Key | undefined> {
    return this._keys.get(key);
  }

  public async createKey(
    owner: string,
    ips: string[],
    comment: string,
    permissionType: "group" | "custom",
    permissions: number,
    manuallyCreated: boolean = false
  ): Promise<Key> {
    const key = new Key();

    if (permissionType === "group") {
      if (permissions < 0 || permissions > 3) {
        throw new Error("Invalid permissions!");
      }

      key.permissions = getPerms(permissions);
    } else {
      if (permissions < 0 || permissions > 0xffffffff) {
        throw new Error("Invalid permissions!");
      }

      key.permissions = permissions;
    }

    key.owner = owner;
    key.ips = ips;
    key.comment = comment;

    key.key = Util.randomString(32);

    key.manuallyCreated = manuallyCreated || false;
    key.enabled = true;

    await db.getEntityManager().persistAndFlush(key);
    this._keys.set(key.key, key);

    return key;
  }

  public async removeKey(key: string): Promise<void> {
    const keyObj = await this.getKey(key);

    if (!keyObj) {
      throw new Error("Key not found!");
    }

    await db.getEntityManager().removeAndFlush(keyObj);
    this._keys.delete(key);
  }

  public async setKeyEnabled(key: string, enabled: boolean): Promise<void> {
    const keyObj = await this.getKey(key);

    if (!keyObj) {
      throw new Error("Key not found!");
    }

    keyObj.enabled = enabled;

    await db.getEntityManager().persistAndFlush(keyObj);
  }
}
