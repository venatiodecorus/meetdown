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

function isValidDateRange(range: DateRange): boolean {
  return range.start < range.end;
}

function formatDateRange(range: DateRange): string {
  return `[${range.start.toISOString().split("T")[0]},${
    range.end.toISOString().split("T")[0]
  }]`;
}

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

export async function getEvent(hash: string) {
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
