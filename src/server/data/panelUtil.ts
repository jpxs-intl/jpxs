import { ServerData } from "sub-rosa-servers";
import fetch from "node-fetch";
import DataStorage from "./dataStorage";
import CacheStorage from "../database/cacheStorage";

export default class PanelUtil {
  public static async updateServers(data: ServerData[]) {
    const nodes: List<Node> = await PanelUtil.request("GET", "/nodes");

    const allocations = await Promise.all(
      nodes.data.map(async (node) => {
        const allocations: List<Allocation> = await PanelUtil.request(
          "GET",
          `/nodes/${node.attributes.id}/allocations`
        );
        return allocations.data.map((allocation) => allocation.attributes);
      })
    ).then((allocations) => allocations.flat().filter((allocation) => allocation.assigned));

    const servers: List<Server> = await PanelUtil.request("GET", "/servers");

    servers.data.forEach(async (server) => {

        if (server.attributes.nest !== 5) return;

      const serverAllocation = allocations.find(
        (allocation) => allocation.id === server.attributes.allocation
      );
      if (!serverAllocation) return;

      const serverData = data.find(
        (serverData) =>
            serverData.address === serverAllocation.ip && serverData.port === serverAllocation.port
        );

        if (!serverData) return;

      const serverId = await CacheStorage.addressMap.get({
        address: serverData.address,
        port: serverData.port,
      })

      this.request("PATCH", `/servers/${server.attributes.id}/details`, {
        name: `${serverData?.name} (${serverData.players}/${serverData.maxPlayers}) ${serverId && DataStorage.serverData[serverId] ? `[${DataStorage.serverData[serverId].tps.toFixed(2)} TPS]` : ""}`,
        description: `Address: ${serverData.address}:${serverData.port}\nVersion: ${serverData.version}${serverData.build}\nGame Type: ${serverData.gameType}\nPassworded: ${serverData.passworded}`,
        user: server.attributes.user,
      });
    });
  }

  public static async request(method: string, path: string, body?: any) {
    return await fetch(`${process.env.PTERODACTYL_API_URL}${path}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json",
        Authorization: `Bearer ${process.env.PTERODACTYL_API_KEY}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then((res) => res.json());
  }
}

interface List<T> {
  object: string;
  data: Datum<T>[];
  meta: {
    pagination: Pagination;
  };
}

interface Datum<T> {
  object: string;
  attributes: T;
}

interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

interface Node {
  id: number;
  uuid: string;
  public: boolean;
  name: string;
  description: string;
  location_id: number;
  fqdn: string;
  scheme: string;
  behind_proxy: boolean;
  maintenance_mode: boolean;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  daemon_listen: number;
  daemon_sftp: number;
  daemon_base: string;
  created_at: string;
  updated_at: string;
}

interface Allocation {
  id: number;
  ip: string;
  alias?: any;
  port: number;
  notes?: string;
  assigned: boolean;
}

interface Server {
  id: number;
  external_id: string;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  suspended: boolean;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads?: any;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  user: number;
  node: number;
  allocation: number;
  nest: number;
  egg: number;
  pack?: any;
  container: {
    startup_command: string;
    image: string;
    installed: boolean;
    environment: {
      [key: string]: string;
    };
  };
  updated_at: string;
  created_at: string;
  relationships: {
    databases: List<Database>;
  };
}

interface Database {
  id: number;
  server: number;
  host: number;
  database: string;
  username: string;
  remote: string;
  max_connections: number;
  created_at: string;
  updated_at: string;
}
