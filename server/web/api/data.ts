import { Router, json } from 'express';

const router = Router();
router.use(json());

router.post('/', async (req, res) => {

    console.log(req.body);

    res.json({ status: "ok" });
})

router.post("/init", async (req, res) => {

    console.log(req.body);

    res.json({ status: "ok" });
})

export default router;