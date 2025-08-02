import { Router } from 'express';
import serversApiRouter from './api/servers.js';
import playerApiRouter from './api/player.js';
import avatarApiRouter from './api/avatar.js';
const apiRouter = Router();

apiRouter.use("/servers", serversApiRouter);
apiRouter.use("/player", playerApiRouter);
apiRouter.use("/avatar", avatarApiRouter);

export default apiRouter;