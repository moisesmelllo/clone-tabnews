import { createRouter } from "next-connect";
import migrationsRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "/infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationsRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    response.status(200).json(pendingMigrations);
  } finally {
    dbClient.end();
  }
}

async function postHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationsRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    response.status(200).json(migratedMigrations);
  } finally {
    dbClient.end();
  }
}
