import migrationsRunner from 'node-pg-migrate'
import {join} from 'node:path'
import database from '/infra/database'

export default async function migrations(request, response) {
  const allowedMethods = ['GET', 'POST'];
  if(!allowedMethods.includes(request.method)) {
    return response.status(405).json( {
      error: `${request.method} not allowed`
    });
  }

  let dbClient;
  try {
  dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    migrationsTable: 'pgmigrations',
  }


  if(request.method === 'GET') {
    const pendingMigrations = await migrationsRunner(defaultMigrationOptions)
  
    response.status(200).json(pendingMigrations);
  
  }

  if(request.method === 'POST') {
    const migratedMigrations = await migrationsRunner({
      ...defaultMigrationOptions,
      dryRun: false
    })

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations)
    }
  
    response.status(200).json(migratedMigrations);
  }
  } catch (error) {
    console.error(error)
    throw error;
  } finally {
    dbClient.end()
  }
}


