import { Router } from 'express';
import AuthRouter from './auth.js';
import ApiRouter from "./api.js";
import authMiddleware from '../auth/middleware.js';
import Index from '../../../../../client/index.js';
import ComponentRouter from './component.js';
import path from 'path';
import GlobalLogger from '../../../../../utils/logger.js';


const router = Router();

// unprotected routes

if (process.env.WEBSERVER_DEBUG === "true") {
    router.use((req, res, next) => {
        GlobalLogger.debug("Webserver", `[${req.method}] ${req.path}`);
        next();
    });
}

router.use("/auth", AuthRouter);
router.use("/api", ApiRouter);

router.get("/avatar", (req, res) => {
    res.sendFile(path.resolve("./src/client/static/avatars/index.html"));
});

router.use(authMiddleware);

// protected routes

router.use("/component", ComponentRouter)

router.get("/debug", async (req, res) => {
    res.sendFile(path.resolve("./src/client/static/dist/index.html"));
})

router.get("*", async (req, res) => {
    res
        .header("Content-Type", "text/html")
        .send(await Index({
            path: req.path,
            session: req.body.session,
        }))
});


export default router;