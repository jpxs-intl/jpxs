import { Router } from 'express';
import { AuthSession } from '../../../../../database/entities/authSession.entity.js';
import LivePage from '../../../../../client/pages/live.js';
import ServerPage from '../../../../../client/pages/server.js';
import PlayerPage from '../../../../../client/pages/player.js';
import HomePage from '../../../../../client/pages/home.js';
import LiveServers from '../../../../../client/components/live/subpages/liveServer.js';
import ServerList from '../../../../../client/components/live/serverList.js';
const ComponentRouter = Router();

const pages: {
    [key: string]: (props: { session: AuthSession, path: string }) => Promise<any>;
} = {
    'live': LivePage,
    'liveServers': LiveServers,
    'server': ServerPage,
    'player': PlayerPage,
    'home': HomePage
}

const components: {
    [key: string]: (props: { session: AuthSession }) => Promise<any>;
} = {
    'serverList': ServerList,
}

ComponentRouter.get("/page/:page", async (req, res) => {
    const page = req.params.page;

    if (!page) {
        return res.status(400).json({ error: 'Page id is required' });
    }

    const path = req.path.replace("/page/", "")
    const session = req.body.session as AuthSession;

    const pageFunction = pages[page];

    if (!pageFunction) {
        return res.status(404).json({ error: 'Page not found' });
    }

    try {
        const pageComponent = await pageFunction({ session, path, ...req.query });
        res
            .setHeader('Content-Type', 'text/html')
            .send(pageComponent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

ComponentRouter.get("/:component", async (req, res) => {
    const component = req.params.component;

    if (!component) {
        return res.status(400).json({ error: 'Component id is required' });
    }

    const session = req.body.session as AuthSession;
    const componentFunction = components[component];
    if (!componentFunction) {
        return res
            .status(404)
            .json({ error: 'Component not found' });
    }

    try {
        const componentElement = await componentFunction({ session, ...req.query });
        res
            .setHeader('Content-Type', 'text/html')
            .send(componentElement);
        return
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: 'Internal server error' });
        return;
    }
})

export default ComponentRouter;