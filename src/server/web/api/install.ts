import { Router } from 'express';
import path from 'path';
import Logger from '../../../utils/logger';
import KeyManager from '../../database/keyManager';
const router = Router();

const keys = require(path.resolve("./keys.js")).keys as { name: string, key: string, identifier: string }[];
const downloadLink = require(path.resolve("./keys.js")).downloadLink as string;

router.get('/downloadLink', async (req, res) => {
    res.status(200).setHeader('Content-Type', 'text/plain').send(downloadLink);
})

router.get('/tag', async (req, res) => {

    if (!req.query) {
        res.status(400).json({
            error: 'Missing query parameters',
        });
        return;
    }

    const { i, k } = req.query;

    if (!i || !k) {
        res.status(400).json({
            error: 'Missing required fields!',
        });
        return;
    }

    const key = k as string;
    const identifier = i as string;

    const keyData = keys.find(k => k.identifier === identifier);

    if (!keyData|| keyData.key !== key) {
        res.status(400).json({
            error: 'Invalid request',
        });
        return;
    }

    Logger.info('Install', `Asset tag requested for script ${keyData.name}, creating asset key`)

    const assetKey = await KeyManager.instance.createKey(keyData.name, [], `AssetTag: ${keyData.name}-${keyData.identifier}`, 'group', 3)
    res.status(200).setHeader('Content-Type', 'text/plain').send(assetKey.key);

})

export default router;