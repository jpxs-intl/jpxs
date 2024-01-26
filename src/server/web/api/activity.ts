import { Router } from 'express';
import { db } from '../../../index';
import { ActivityUser } from '../../discord/modules/activity/entities/ActivityUser.entity';
import { ActivityUpdate } from '../../discord/modules/activity/entities/ActivityUpdate.entity';
const router = Router();

router.get("/search/:query", async (req, res) => {

    const users = await db.em.find(ActivityUser, {
        username: new RegExp(req.params.query, "i")
    });

    res.json(users.map(user => ({
        id: user.id,
        username: user.username
    })));
})

router.get("/:id", async (req, res) => {
    const user = await db.em.findOne(ActivityUser, req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const updates = await db.em.find(ActivityUpdate, {
        user: {
            id: user.id
        },
        timestamp: {
            $gte: req.query.after ? new Date(parseInt(req.query.after as string)) : new Date(0),
            $lte: req.query.before ? new Date(parseInt(req.query.before as string)) : new Date()
        }
    }, {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        orderBy: {
            timestamp: "DESC"
        }
    })

    res.json({
        id: user.id,
        username: user.username,
        updates: updates.map(update => ({
            id: update.id,
            activity: update.activity,
            timestamp: update.timestamp.getTime()
        }))
    })

});

export default router;