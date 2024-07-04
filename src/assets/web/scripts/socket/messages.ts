import { ServerData } from "sub-rosa-servers";
import { Server } from "../../../../database/entities/server.entity";
import { Snapshot } from "../../../../database/entities/snapshot.entity";

export interface ServerToClentEvents { }

export interface ClientToServerEvents {
  liveservers: (callback: (servers: FullServerData[]) => void) => void;
  server: (id: string, callback: (server: DatabaseServerData | undefined) => void) => void;
}

export interface FullServerData extends ServerData {
  masterServer: "vanilla" | "RosaClassic";
  id: string;
  region?: string;
  emoji?: string;
}

export interface DatabaseServerData extends Server {
  snapshots: Omit<Snapshot, "server">[];
}
