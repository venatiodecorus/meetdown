"use server";

import { connect } from "./db";
import { nanoid } from "nanoid";
import { Temporal } from "temporal-polyfill";

/**
 * Using strings to avoid issues with Temporal.PlainDate serialization.
 */
type DateRange = {
  start: string;
  end: string;
};

/**
 * Event object to be used when creating new events.
 */
export interface EventRequest {
  /** @deprecated Use dateRanges instead - this will be removed in a future version */
  dates: {
    start: string;
    end: string;
  };
  startTime: string;
  endTime: string;
  name: string;
  dateRanges: string[];
}

/**
 * Event object to be used when retrieving events.
 */
export type EventResponse = {
  id: number;
  hash: string;
  name: string;
  created_at: string;
  /** @deprecated Use dateRanges instead - this will be removed in a future version */
  date_range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  start_time: Temporal.PlainTime;
  end_time: Temporal.PlainTime;
  date_ranges: Temporal.PlainDate[];
};

// /**
//  * Check if a date range is valid.
//  * @param range The date range to check.
//  * @deprecated Not used in the current implementation.
//  */
// function isValidDateRange(range: DateRange): boolean {
//   return range.start < range.end;
// }

/**
 * Format a date range according to Postgres date range syntax.
 * @param range The date range to format.
 * @returns
 */
function formatDateRange(range: DateRange): string {
  return `[${range.start.toString()},${range.end.toString()}]`;
}

/**
 * Save an event to the database.
 * @param e The event object to create.
 * @returns The unique hash of the event as a nanoid.
 */
export async function createEvent(e: EventRequest) {
  const client = await connect();
  try {
    const eventHash = nanoid();

    const res = await client.query(
      `INSERT INTO events (created_at, hash, date_range, name, start_time, end_time, date_ranges) VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
      [eventHash, formatDateRange(e.dates), e.name, e.startTime, e.endTime, e.dateRanges]
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
      start_time: row.start_time,
      end_time: row.end_time,
      date_ranges: row.date_ranges,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
