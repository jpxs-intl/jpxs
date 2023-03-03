import express from 'express';
import { serverGrabber } from '../..';
import Logger from '../logger';

const app = express();

app.get('/servers', async (req, res) => {
    res.json( await serverGrabber.getServerData());
})

app.get('/servers/:masterserver', async (req, res) => {
    res.json( await serverGrabber.getServerDataForMasterServer(req.params.masterserver));
})

app.listen(parseInt(process.env.PORT || "3000"), () => {
    Logger.log("WebServer", `Server is listening on port ${process.env.PORT}`);
})