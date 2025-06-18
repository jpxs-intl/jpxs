import Util from "../../utils/index.js";
import Logger from "../../utils/logger.js";
import Cache from "./cache.js";

export default class UpdatableCache<CachedType, CacheKey = string> extends Cache<CachedType, CacheKey> {
    private _updateMethod: (key: CacheKey) => Promise<CachedType | undefined>;

    constructor(
        updateMethod: (key: CacheKey) => Promise<CachedType | undefined>,
        options?: {
            prune?: boolean;
            limitFactor?: number;
            limitBy?: "time" | "size";
            staleDataThreshold?: number;
        }
    ) {
        super(options?.limitBy || "time", options?.limitFactor ? options.limitFactor : options?.limitBy === "size" ? 100 : 600000, {
            prune: options?.prune,
            staleDataThreshold: options?.staleDataThreshold,
        });
        this._updateMethod = updateMethod;
    }

    public async getOrFetch(key: CacheKey): Promise<CachedType | undefined> {
        const value = this.get(key);
        if (value) {
            Logger.debug("Cache", `Cache hit for ${Util.stringify(key)}`);
            return value;
        }
        Logger.debug("Cache", `Cache miss for ${Util.stringify(key)}`);
        return this.forceGet(key);
    }

    public async forceGet(key: CacheKey): Promise<CachedType | undefined> {
        const value = await this._updateMethod(key);
        if (value) {
            Logger.debug("Cache", `Fetch hit for ${Util.stringify(key)}, updating cache`);
            this.set(key, value);
        } else {
            Logger.debug("Cache", `Fetch miss for ${Util.stringify(key)}, deleting from cache`);
            this.delete(key);
        }
        return value;
    }
}