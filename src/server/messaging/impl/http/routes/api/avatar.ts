import { Router } from 'express';
import Core from '../../../../../core.js';
const avatarApiRouter = Router();

avatarApiRouter.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Avatar ID is required' });
    }

    try {
        const avatarHistory = await Core.services.avatarHistory.findOne({
            player: {
                $or: [
                    { gameId: parseInt(id) },
                    { phoneNumber: parseInt(id.replace(/-/g, "")) },
                ]
            }
        }, {
            populate: ['avatar'],
            orderBy: { createdAt: 'DESC' }
        })

        if (!avatarHistory) {
            return res.status(404).json({ error: 'Avatar not found' });
        }

        res.json(avatarHistory.avatar);
    } catch (error) {
        console.error(`Error fetching avatar for id ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

export default avatarApiRouter;