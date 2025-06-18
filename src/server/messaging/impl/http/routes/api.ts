import { Router } from 'express';
import serversRouter from './servers.js';
const apiRouter = Router();

apiRouter.use("/servers", serversRouter);

export default apiRouter;