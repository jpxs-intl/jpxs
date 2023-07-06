import CacheStorage from "../cacheStorage";
import UpdateableCache from "./updateableCache";

export default class CacheInfo {
  public static readonly caches = {
    users: CacheStorage.users,
    playerAutoComplete: CacheStorage.playerAutoComplete,
    steamIdMap: CacheStorage.steamIdMap,
    gameIdMap: CacheStorage.gameIdMap,
    addressMap: CacheStorage.addressMap,
    servers: CacheStorage.servers,
    snapshots: CacheStorage.snapshots,
  } as {
    [key: string]: {
      _cache: UpdateableCache<any, any>;
    };
  };

  public static readonly cacheNames = Object.keys(CacheInfo.caches);

  public static getCacheReport(): string {
    let report = "";
    for (const cacheName of CacheInfo.cacheNames) {
      const info = CacheInfo.caches[cacheName]._cache.info();

      let cacheText = [`Cache: ${cacheName}`];

      if (info.limitBy == "size") {
        cacheText.push(
          `Size: ${info.size}/${info.limitFactor} (${((info.size / info.limitFactor) * 100).toFixed(2)}%)`
        );
      } else if (info.limitBy == "time") {
        if (info.pruneEnabled)
          cacheText.push(
            `Time: ${Date.now() - info.lastPrune}ms/${info.limitFactor}ms (${(
              ((Date.now() - info.lastPrune) / info.limitFactor) *
              100
            ).toFixed(2)}%)`
          );
        cacheText.push(`Size: ${info.size} items`);
      }

      cacheText.push("");

      cacheText.push(`Hits: ${info.hits}`);
      cacheText.push(`Misses: ${info.misses}`);

      const totalAccesses = info.hits + info.misses;
      cacheText.push(`Hit Rate: ${((info.hits / totalAccesses) * 100).toFixed(2)}%`);
      cacheText.push(`Total Accesses: ${totalAccesses}`);

      report += cacheText.join("\n") + "\n\n-----\n\n";
    }
    return report;
  }
}
