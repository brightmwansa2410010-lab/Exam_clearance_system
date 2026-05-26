require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = 'exam_clearance';

function makeClient(database) {
  return new Client({ user: DB_USER, password: DB_PASSWORD, host: DB_HOST, port: DB_PORT, database });
}

async function runSchema(client) {
  const schema = fs.readFileSync(path.join(__dirname, 'migrations', 'schema.sql'), 'utf8');
  await client.query(schema);
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS student_id TEXT,
      ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
      ADD COLUMN IF NOT EXISTS nrc_front_url TEXT,
      ADD COLUMN IF NOT EXISTS nrc_back_url TEXT,
      ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS study_mode TEXT,
      ADD COLUMN IF NOT EXISTS gender TEXT;
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_student_id_unique_idx ON users(student_id);
    `);
    await client.query(`
      ALTER TABLE requests
      ADD COLUMN IF NOT EXISTS courses_examined TEXT;
    `);
  console.log('✓ Schema loaded successfully');
}

async function setupDatabase() {
  const rootClient = makeClient('postgres');
  await rootClient.connect();
  try {
    await rootClient.query(`CREATE DATABASE ${DB_NAME}`);
    console.log('✓ Database "exam_clearance" created');
  } catch (err) {
    if (!err.message.includes('already exists')) throw err;
    console.log('⚠️  Database already exists.');
  }
  await rootClient.end();

  const dbClient = makeClient(DB_NAME);
  await dbClient.connect();
  await runSchema(dbClient);
  await dbClient.end();
  console.log('\n✅ Database setup complete!');
  process.exit(0);
}

setupDatabase().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
