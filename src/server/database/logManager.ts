import { db } from "../..";
import { Log } from "../../database/entities/log";
import Logger from "../../utils/logger";

export default class LogManager {

    private static _logCache: { [serverId: string]: [string, string][] } = {};

    private static readonly _maxCacheSize = 1000;
    private static readonly _cacheTimeout = 60000;

    private static _cacheTimeoutHandle: NodeJS.Timeout;

    public static init() {
        this._cacheTimeoutHandle = setInterval(() => {
            this._persistAll();
        }, this._cacheTimeout);
    }

    public static destroy() {
        clearInterval(this._cacheTimeoutHandle);
    }

    public static get size() {
        return Object.values(this._logCache).reduce((acc, val) => acc + val.length, 0);
    }

    public static log(serverId: string, type: string, log: string) {
        if (!this._logCache[serverId]) this._logCache[serverId] = [];
        this._logCache[serverId].push([type, log]);

        if (this.size >= this._maxCacheSize) {
            this._persistAll();
        }

        Logger.debug(serverId, `[${type}] ${log}`);
    }

    public static get(serverId: string | string[], opt?: {
        time?: {
            before?: number,
            after?: number
        },
        page?: {
            size?: number,
            number?: number
        },
        type?: string | string[],
        order?: 'ASC' | 'DESC'
    }): Promise<Log[]> {

        return db.em.find(Log, {
            serverId: Array.isArray(serverId) ? { $in: serverId } : serverId,
            timestamp: {
                $gt: opt?.time?.after || 0,
                $lt: opt?.time?.before || Date.now()
            },
            type: opt?.type ? Array.isArray(opt.type) ? { $in: opt.type } : opt.type : undefined
        }, {
            limit: opt?.page?.size || 100,
            offset: opt?.page?.number ? (opt.page.number - 1) * (opt.page.size || 100) : 0,
            orderBy: {
                timestamp: opt?.order || 'DESC'
            }
        });
    }

    private static async _persistAll() {
        const logsToPersist = Object.entries(this._logCache).map(([serverId, logs]) => {
            return logs.map(log => (Log.create(serverId, log[0], log[1])));
        }).flat();

        await db.em.persistAndFlush(logsToPersist).catch(err => {
            Logger.error('LogManager', `Failed to persist logs: ${err.message}`);
        })
            .then(() => {
                Logger.debug('LogManager', `Persisted ${logsToPersist.length} logs`);
            })
            .finally(() => {
                this._logCache = {};
            })
    }
}

LogManager.init();

