import { Router } from "express";
import { db } from "../../../index";
import { Snapshot } from "../../../database/entities/snapshot.entity";
import ServerDatabaseManager from "../../database/serverDatabaseManager";
const router = Router();

router.get("/autocomplete/:query", async (req, res) => {
  const query = req.params.query;

  const snapshots = await db.getEntityManager().find(Snapshot, {
    name: new RegExp(`^${query}`, "i"),
  });

  if (!snapshots || snapshots.length === 0) {
    return res.status(404).json({
      success: false,
      error: "Server not found",
    });
  }

  // filter out duplicates by server id

  const ids: string[] = [];

  snapshots.forEach((snapshot) => {
    if (!ids.includes(`${snapshot.server.address}:${snapshot.server.port}`)) {
      ids.push(`${snapshot.server.address}:${snapshot.server.port}`);
    }
  });

  const snapshotsToSend = snapshots
    .sort((a, b) => {
      return b.timestamp.getTime() - a.timestamp.getTime();
    })
    .filter((snapshot) => ids.includes(`${snapshot.server.address}:${snapshot.server.port}`))
    .slice(0, 25);

  return res.json({
    success: true,
    servers: snapshotsToSend.map((snapshot) => {
      return {
        id: snapshot.server.id,
        name: snapshot.name,
       server: snapshot
      };
    }),
  });
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  res.json(await ServerDatabaseManager.getServerForClient(id))
  
});

export default router;
