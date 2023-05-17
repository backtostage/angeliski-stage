import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { GithubEntityProvider } from '@backstage/plugin-catalog-backend-module-github';


export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

    let githubProvider = GithubEntityProvider.fromConfig(env.config, {
        logger: env.logger,
        schedule: env.scheduler.createScheduledTaskRunner({
            frequency: { minutes: 30 },
            timeout: { minutes: 3 },
        }),
    });

    builder.addEntityProvider(
        githubProvider,
       );

    env.eventBroker.subscribe(githubProvider);

  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.setProcessingIntervalSeconds(7200)
  const { processingEngine, router } = await builder.build();

  await processingEngine.start();
  return router;
}
