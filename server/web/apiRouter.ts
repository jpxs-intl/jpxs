import { Router } from 'express';
import path from 'path';

import ServersRouter from './api/servers';
import ServerRouter from './api/server';
import DataRouter from './api/data';
import BotRouter from './api/bot';
import PlayerRouter from './api/player';
import AuthRouter from './api/auth/oauthRouter'
import CacheInfo from '../database/cache/cacheInfo';

const router = Router();

router.use('/servers', ServersRouter);
router.use('/server', ServerRouter);
router.use('/data', DataRouter);
router.use('/bot', BotRouter);
router.use('/player', PlayerRouter);
router.use("/auth", AuthRouter);

router.get('/plugin', async (req, res) => {
    res
    .set('Content-Type', 'text/plain')
    .sendFile(path.resolve("./assets/plugin.lua"))
})


router.get('/plugin/download/static', async (req, res) => {
    res
    .set('Content-Disposition', 'attachment; filename="JPXSUploader.lua"')
    .set('Content-Type', 'text/plain')
    .sendFile(path.resolve("./assets/staticPlugin.lua"))
})

router.get('/cache', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(CacheInfo.getCacheReport());
})

export default router;