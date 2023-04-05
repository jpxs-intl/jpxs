import { db } from "../..";
import { Key } from "../../database/entities/key.entity";

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
        const keys = await db.getEntityManager().find(Key, {})
        keys.forEach((key) => {
            this._keys.set(key.key, key);
        });
    }

    public async getKey(key: string): Promise<Key | undefined> {
        return this._keys.get(key);
    }
}