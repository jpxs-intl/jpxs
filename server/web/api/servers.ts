import { Router } from 'express';
import { serverGrabber } from '../../..';
const router = Router();

router.get('/', async (req, res) => {
    res.json( await serverGrabber.getServerData());
})

router.get('/:masterserver', async (req, res) => {
    res.json( await serverGrabber.getServerDataForMasterServer(req.params.masterserver));
})

export default router;