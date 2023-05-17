import {
    EventsBackend,
    HttpPostIngressEventPublisher,
} from '@backstage/plugin-events-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {GithubEventRouter} from "@backstage/plugin-events-backend-module-github";

export default async function createPlugin(
    env: PluginEnvironment,
): Promise<Router> {
    const eventsRouter = Router();
    const githubEventRouter = new GithubEventRouter();

    const http = HttpPostIngressEventPublisher.fromConfig({
        config: env.config,
        logger: env.logger,
    });
    http.bind(eventsRouter);

    await new EventsBackend(env.logger)
        .setEventBroker(env.eventBroker)
        .addPublishers(githubEventRouter)
        .addSubscribers(githubEventRouter)
        .addPublishers(http)
        .start();

    return eventsRouter;
}