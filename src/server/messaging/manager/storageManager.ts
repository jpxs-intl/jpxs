import Core from "../../core.js";
import { StorageChannel, StorageError } from "../channels/storage.js";

export default class StorageManager {

    public static readonly clientId = "jpxs.storageManager";

    public static init() {
        StorageChannel.registerCallback(this.clientId, "get", async (data) => {
            const entry = await Core.services.storage.findOne({ key: data.key })

            return entry ? {
                success: true,
                value: entry.value
            } : {
                success: false,
                error: StorageError.NotFound
            }

        });

        StorageChannel.registerCallback(this.clientId, "set", async (data) => {
            const entry = await Core.services.storage.findOne({ key: data.key })

            if (entry) {
                if (entry.token && entry.token !== data.token) {
                    return {
                        success: false,
                        error: StorageError.InvalidToken
                    }
                }

                entry.value = data.value
                await Core.services.em.persistAndFlush(entry)
                return {
                    success: true
                }
            }

            const newEntry = Core.services.storage.create({
                key: data.key,
                value: data.value,
                token: data.token
            });

            await Core.services.em.persistAndFlush(newEntry);
            return {
                success: true
            };
        });

        StorageChannel.registerCallback(this.clientId, "delete", async (data) => {
            const entry = await Core.services.storage.findOne({ key: data.key })

            if (entry) {

                if (entry.token && entry.token !== data.token) {
                    return {
                        success: false,
                        error: StorageError.InvalidToken
                    }
                }

                await Core.services.em.removeAndFlush(entry)
                return {
                    success: true
                }
            }

            return {
                success: false,
                error: StorageError.NotFound
            }
        });
    }
}
