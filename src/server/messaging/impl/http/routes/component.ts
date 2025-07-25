import { Router } from 'express';
import { AuthSession } from '../../../../../database/entities/authSession.entity.js';
import LivePage from '../../../../../client/pages/live.js';
import ServerPage from '../../../../../client/pages/server.js';
import PlayerPage from '../../../../../client/pages/player.js';
import HomePage from '../../../../../client/pages/home.js';
import LiveServers from '../../../../../client/components/live/subpages/liveServer.js';
import ServerList from '../../../../../client/components/live/serverList.js';
import path from 'path';
const ComponentRouter = Router();

const componentCache: Record<string, (props: { session: AuthSession, path: string }) => Promise<string>> = {}

// dont allow unsafe path traversal (e.g. /../, /./, or //)
// replace . with / to signify a path traversal
function sanitizePath(path: string): string {
    return path.replace(/(\.\.\/|\/\.\.\/|\/\/)/g, '').replace(/\./g, '/')
}

function getComponentPath(component: string): string {
    // Ensure the component name is safe and does not contain path traversal characters
    const sanitizedComponent = sanitizePath(component);
    return path.resolve("./dist/client/", sanitizedComponent + ".js")
}

async function getComponent(input: string): Promise<((props: { session: AuthSession, path: string }) => Promise<string>) | undefined> {
    const componentPath = getComponentPath(input);
    console.log(`Loading component from path: ${componentPath}`);
    try {
        const componentModule = await import(componentPath);
        if (componentModule.default) {
            return componentModule.default;
        }
    } catch (error) {
        console.error(`Error loading component ${input}:`, error);
    }

    return undefined;
}

ComponentRouter.get("/page/:page", async (req, res) => {
    const page = req.params.page;

    if (!page) {
        return res.status(400).json({ error: 'Page id is required' });
    }

    const path = req.path.replace("/page/", "")
    const session = req.body.session as AuthSession;

    const pageFunction = componentCache[page] || await getComponent("pages/" + page);

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
        res.status(500).json({ error: 'Internal server error', detail: error });
    }
})

ComponentRouter.get("/:component", async (req, res) => {
    const component = req.params.component;

    if (!component) {
        return res.status(400).json({ error: 'Component id is required' });
    }

    const session = req.body.session as AuthSession;

    const componentFunction = componentCache[component] || await getComponent(`components/${component}`);

    if (!componentFunction) {
        return res
            .status(404)
            .json({ error: 'Component not found' });
    }

    try {
        // @ts-ignore add extra properties as props
        const componentElement = await componentFunction({ session, ...req.query });
        res
            .setHeader('Content-Type', 'text/html')
            .send(componentElement);
        return
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: 'Internal server error', detail: error });
        return;
    }
})

export default ComponentRouter;