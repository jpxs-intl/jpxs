import fs from "fs";
import path from "path";

function loadToFile() {
  const gameIds = JSON.parse(fs.readFileSync(path.resolve("/home/gooch/Downloads/cool2.json"), "utf8"));

  const length = Object.keys(gameIds).length * 8; // 4 bytes for gameid, 4 bytes for phone number
  const buffer = Buffer.alloc(length);

  let index = 0;
  for (const gameid in gameIds) {
    buffer.writeUInt32LE(parseInt(gameid), index);
    buffer.writeUInt32LE(gameIds[gameid].phone, index + 4);
    index += 8;
  }

    fs.writeFileSync(path.resolve("./gameid.bin"), buffer);
}

export type gameIds = {
  [gameid: string]: {
    blacklisted: boolean;
    phone: number;
  };
};

loadToFile();
