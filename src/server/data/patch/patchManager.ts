import fs from "fs";
import path from "path";
import Logger from "../../../utils/logger";
import DataStorage from "../dataStorage";
import ExecInstruction from "../instruction/types/execInstruction";
import InstructionManager from "../instruction/instructionManager";

export default class PatchManager {
  public static patches: {
    [patchName: string]: string;
  };
  public static patchLocation: string = path.resolve("./src/server/data/patch/patches/");

  public static loadPatches() {
    const patches = fs.readdirSync(this.patchLocation).filter((file) => file.endsWith(".lua"));

    this.patches = {};

    for (const patch of patches) {
      const patchName = patch.split(".")[0];
      const patchContent = fs.readFileSync(path.resolve(this.patchLocation, patch), "utf-8");

      this.patches[patchName] = patchContent;
    }

    Logger.info("PatchManager", `Loaded ${this.patches.length} patches`);
  }

  public static async pushPatches() {
    const servers = Object.keys(DataStorage.serverData);

    for (const server of servers) {
      if (DataStorage.serverData[server].sentPatch) continue;

      Object.keys(this.patches).forEach(async (patch) => {
        await InstructionManager.addInstructionWithResponse(
          new ExecInstruction(server, { code: this.patches[patch] })
        );
      });

      DataStorage.serverData[server].sentPatch = true;
    }
  }
}
