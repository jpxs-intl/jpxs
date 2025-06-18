import { Router } from 'express';
import DataStorage from '../../../../data/dataStorage.js';
import Util from '../../../../../utils/index.js';
const serversRouter = Router();

serversRouter.get('/', (req, res) => {
    res.json(
        Object.entries(DataStorage.serverInfo).map(([key, value]) => {
            return [key, Util.removeKeys(value, ["partial"])]
        }).reduce((acc, [key, value]) => {
            acc[key as string] = value;
            return acc;
        }, {} as Record<string, any>)
    )
})

serversRouter.get('/:id', (req, res) => {
    const server = DataStorage.serverInfo[req.params.id];
    if (!server) {
        return res.status(404).json({ error: 'Server not found' });
    }
    res.json(Util.removeKeys(server, ["partial"]));
})

export default serversRouter;

