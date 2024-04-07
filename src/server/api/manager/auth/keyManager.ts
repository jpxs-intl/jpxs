import Util from "../../../../utils";
import Id from "../../../../utils/id";
import { Logger } from "../../../../utils/logger";
import Core from "../../../core";
import { Key } from "../../../database/entities/key.entity";
import { getPerms } from "../../../types/keyPerms";

export default class KeyManager {
    private static keys: Map<string, Key> = new Map();
    private static logger = Logger.create("KeyManager");

    public static async loadKeys(): Promise<void> {
        const keys = await Core.db.em.find(Key, {});
        keys.forEach((key) => {
            this.keys.set(key.key, key);
        });

        this.logger.info("KeyManager", `Loaded ${keys.length} keys`);
    }

    public static async getKey(key: string): Promise<Key | undefined> {
        const k = this.keys.get(key);
        if (k) {
            return k;
        }

        if (!Core.db.orm) return undefined

        const keyEntity = await Core.db.em.findOne(Key, {
            key: key,
        })

        if (keyEntity) {
            this.keys.set(key, keyEntity);
            return keyEntity;
        }

        return undefined;
    }

    public static async createKey(
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
            if (permissions < 0) {
                throw new Error("Invalid permissions!");
            }

            key.permissions = permissions;
        }

        key.owner = owner;
        key.ips = ips;
        key.comment = comment;
        key.manuallyCreated = manuallyCreated || false;
        key.enabled = true;

        await Core.db.em.persistAndFlush(key);
        this.keys.set(key.key, key);

        return key;
    }

    public static async removeKey(key: string): Promise<void> {
        const keyObj = await this.getKey(key);

        if (!keyObj) {
            throw new Error("Key not found!");
        }

        await Core.db.em.removeAndFlush(keyObj);
        this.keys.delete(key);
    }

    public static async setKeyEnabled(key: string, enabled: boolean): Promise<void> {
        const keyObj = await this.getKey(key);

        if (!keyObj) {
            throw new Error("Key not found!");
        }

        keyObj.enabled = enabled;

        await Core.db.em.persistAndFlush(keyObj);
    }
}