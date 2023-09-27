import Logger from "../../utils/logger";
import PanelUtil from "../data/panelUtil";
import PersistantStorage from "../../utils/persistantStorage";
import { Stats } from "./types";
import Time from "../discord/core/utils/time";

export default class LTM {
  public static servers: {
    name: string;
    panelId: string;
  }[] = [
    {
      name: "Battle Royale",
      panelId: "d87a6677",
    },
    {
      name: "Modded Versus",
      panelId: "d920578a",
    },
  ];

  public static currentMode: string = "Loading...";
  public static nextVote: number = 0;

  public static override = {
    url: process.env.LTM_API_URL as string,
    key: process.env.LTM_API_KEY as string,
  };

  public static async init() {
    if (!PersistantStorage.has("ltm.currentMode")) {
      PersistantStorage.set("ltm.currentMode", this.currentMode);
    }

    this.currentMode = PersistantStorage.get<string>("ltm.currentMode");


    if (!PersistantStorage.has("ltm.nextVote")) {
      PersistantStorage.set("ltm.nextVote", new Time("7d").fromNow().ms());
    }

    const servers = await LTM.getServers();

    servers.forEach((server) => {
      Logger.log("LTM", `Server ${server.name} is ${server.status}`);
    });
  }

  public static async getServers(): Promise<
    {
      name: string;
      panelId: string;
      status: string;
    }[]
  > {
    const servers = await Promise.all(
      LTM.servers.map(async (server) => {
        const status = await LTM.getServerStatus(server.panelId);
        return {
          ...server,
          status: status.attributes.current_state,
        };
      })
    );

    return servers;
  }

  public static async getServerStatus(panelId: string): Promise<Stats> {
    return PanelUtil.request(
      "GET",
      `/servers/${panelId}/resources`,
      undefined,
      LTM.override
    ) as Promise<Stats>;
  }
}
