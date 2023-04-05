import { Router } from 'express';
import path from 'path';

import ServersRouter from './api/servers';
import DataRouter from './api/data';
import Logger from '../logger';

const router = Router();

router.use('/servers', ServersRouter);
router.use('/data', DataRouter);

router.get('/plugin', async (req, res) => {
    res
    .set('Content-Type', 'text/plain')
    .sendFile(path.resolve("./assets/plugin.lua"))
})

router.get('/plugin/download', async (req, res) => {
    res
    .set('Content-Disposition', 'attachment; filename="JPXSUploader.lua"')
    .set('Content-Type', 'text/plain')
    .sendFile(path.resolve("./assets/pluginDownload.lua"))
})

router.get('/plugin/download/static', async (req, res) => {
    res
    .set('Content-Disposition', 'attachment; filename="JPXSUploaderStatic.lua"')
    .set('Content-Type', 'text/plain')
    .sendFile(path.resolve("./assets/staticPlugin.lua"))
})

export default router;