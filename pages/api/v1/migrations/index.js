import { createRouter } from "next-connect";
import migrator from "models/migrator"
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
    const pendingMigrations = await migrator.listPendingMigrations();

    response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {

    const migratedMigrations = await migrator.runPendingMigrations();

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    response.status(200).json(migratedMigrations);

}
