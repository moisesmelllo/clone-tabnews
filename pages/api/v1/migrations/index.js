import migrationsRunner from 'node-pg-migrate'
import {join} from 'node:path'
import database from '/infra/database'

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    migrationsTable: 'pgmigrations',
  }


  if(request.method === 'GET') {
    const pendingMigrations = await migrationsRunner(defaultMigrationOptions)
    await dbClient.end();
  
    
    response.status(200).json(pendingMigrations);
  
  }

  if(request.method === 'POST') {
    const migratedMigrations = await migrationsRunner({
      ...defaultMigrationOptions,
      dryRun: false
    })

    await dbClient.end();

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations)
    }
  
    response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}

