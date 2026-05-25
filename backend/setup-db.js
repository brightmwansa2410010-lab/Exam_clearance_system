require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = 'exam_clearance';

async function setupDatabase() {
  const client = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL...');

    await client.query(`CREATE DATABASE ${DB_NAME}`);
    console.log('✓ Database "exam_clearance" created');
    await client.end();

    const dbClient = new Client({
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
    });

    await dbClient.connect();
    console.log('Connected to exam_clearance database...');

    const schema = fs.readFileSync(path.join(__dirname, 'migrations', 'schema.sql'), 'utf8');
    await dbClient.query(schema);
    await dbClient.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS student_id TEXT,
      ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
      ADD COLUMN IF NOT EXISTS nrc_front_url TEXT,
      ADD COLUMN IF NOT EXISTS nrc_back_url TEXT,
      ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
    `);
    await dbClient.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_student_id_unique_idx ON users(student_id);
    `);
    console.log('✓ Schema loaded successfully');

    await dbClient.end();
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Database already exists. Loading schema...');
      const dbClient = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: DB_NAME,
      });

      try {
        await dbClient.connect();
        const schema = fs.readFileSync(path.join(__dirname, 'migrations', 'schema.sql'), 'utf8');
        await dbClient.query(schema);
        await dbClient.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS student_id TEXT,
          ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
          ADD COLUMN IF NOT EXISTS nrc_front_url TEXT,
          ADD COLUMN IF NOT EXISTS nrc_back_url TEXT,
          ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
        `);
        await dbClient.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS users_student_id_unique_idx ON users(student_id);
        `);
        console.log('✓ Schema loaded successfully');
        await dbClient.end();
        console.log('\n✅ Database setup complete!');
        process.exit(0);
      } catch (err) {
        console.error('Error loading schema:', err.message);
        process.exit(1);
      }
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
}

setupDatabase();
