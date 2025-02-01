"use server";

import { connect } from "./db";
import { nanoid } from "nanoid";

type DateRange = {
  start: Date;
  end: Date;
};

export type Event = {
  dates: DateRange;
  name: string;
};

export type EventResponse = {
  id: number;
  hash: string;
  name: string;
  created_at: string;
  date_range: {
    start: string;
    end: string;
  };
};

/**
 * Check if a date range is valid.
 * @param range The date range to check.
 * @deprecated Not used in the current implementation.
 */
function isValidDateRange(range: DateRange): boolean {
  return range.start < range.end;
}

/**
 * Format a date range according to Postgres date range syntax.
 * @param range The date range to format.
 * @returns
 */
function formatDateRange(range: DateRange): string {
  return `[${range.start.toISOString().split("T")[0]},${
    range.end.toISOString().split("T")[0]
  }]`;
}

/**
 * Save an event to the database.
 * @param e The event object to create.
 * @returns The unique hash of the event as a nanoid.
 */
export async function createEvent(e: Event) {
  const client = await connect();
  try {
    const eventHash = nanoid();

    const res = await client.query(
      `INSERT INTO events (created_at, hash, date_range, name) VALUES (NOW(), $1, $2, $3)`,
      [eventHash, formatDateRange(e.dates), e.name]
    );

    if (res.rowCount != 1) {
      return false;
    }

    return eventHash;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Get an event by its hash.
 * @param hash The unique hash of the event. A nanoid (https://www.npmjs.com/package/nanoid).
 */
export async function getEvent(hash: string): Promise<EventResponse | false> {
  const client = await connect();
  try {
    const res = await client.query(`SELECT * FROM events WHERE hash = $1`, [
      hash,
    ]);

    if (res.rowCount != 1) {
      return false;
    }

    const row = res.rows[0];

    return {
      id: row.id,
      hash: row.hash,
      name: row.name,
      created_at: row.created_at,
      date_range: {
        start: row.date_range.start,
        end: row.date_range.end,
      },
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
