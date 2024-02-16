import { Router } from 'express';
import path from 'path';
import Logger from '../../../utils/logger';
import KeyManager from '../../database/keyManager';
import fetch from 'node-fetch';
const router = Router();

const keys = require(path.resolve("./keys.js")).keys as { name: string, key: string, identifier: string }[];
const downloadLink = require(path.resolve("./keys.js")).downloadLink as string;

router.get('/downloadLink', async (req, res) => {
    Logger.info('Install', `Download link requested.`)
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

    if (!keyData || keyData.key !== key) {
        res.status(400).json({
            error: 'Invalid request',
        });
        return;
    }

    Logger.info('Install', `Asset tag requested for script ${keyData.name}, creating asset key`)

    const assetKey = await KeyManager.instance.createKey(keyData.name, [], `AssetTag: ${keyData.name}-${keyData.identifier}`, 'group', 3)
    res.status(200).setHeader('Content-Type', 'text/plain').send(assetKey.key);

})

router.get('/artifact/:repo/:id/:format', async (req, res) => {
    const { repo, id, format } = req.params;
    const result = await fetch(`https://api.github.com/repos/jpxs-intl/${repo}/actions/artifacts/${id}/${format}`, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        redirect: 'manual'
    });

    if (result.status !== 302) {
        res.status(result.status).json({
            error: 'Artifact not found',
        });
        return;
    } else {
        res.status(302).setHeader('Location', result.headers.get('Location') as string).send();
    }
})

export default router;