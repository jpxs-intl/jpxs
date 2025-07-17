import { Router } from 'express';
import serversApiRouter from './api/servers.js';
import playerApiRouter from './api/player.js';
const apiRouter = Router();

apiRouter.use("/servers", serversApiRouter);
apiRouter.use("/player", playerApiRouter)



export default apiRouter;