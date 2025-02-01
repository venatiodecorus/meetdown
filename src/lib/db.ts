import { Client } from "pg";

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

let isConnected = false;

/**
 * Manages Postgres client connection.
 * @returns The connected client.
 */
export async function connect() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  return client;
}
