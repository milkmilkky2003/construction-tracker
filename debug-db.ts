import * as db from './server/db';
import { projects } from './drizzle/schema';
import 'dotenv/config';

async function check() {
  const d = await db.getDb();
  if (!d) {
    console.error('DB not available');
    return;
  }
  const allProjects = await d.select().from(projects);
  console.log('Current Projects in DB:');
  allProjects.forEach(p => {
    console.log(`- ID: ${p.id}, Name: ${p.name}, AccessCode: "${p.accessCode}"`);
  });
}

check();
