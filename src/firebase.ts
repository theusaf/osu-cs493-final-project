import admin from "firebase-admin";
import { Query } from "firebase-admin/firestore";
import { QueryOptions, QueryWhereOptions } from "./types/database.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_CREDENTIALS!),
  ),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export const storage = admin.storage();

export const connection = admin.firestore();

/**
 * Executes a Firestore query with the given options.
 *
 * @param baseQuery The base query/collection to start with.
 * @param queryOptions The options to apply to the query.
 * @returns The data from the query.
 */
export async function executeQuery<T, TIface extends T = T>(
  baseQuery: Query,
  queryOptions?: QueryOptions<TIface>,
): Promise<T[]> {
  let query = baseQuery;
  // query = query.orderBy("id");
  if (queryOptions?.where) {
    query = recursiveWhere(query, queryOptions.where);
  }
  if (queryOptions?.limit) {
    query = query.limit(queryOptions.limit);
  }
  if (queryOptions?.cursor) {
    query = query.offset(queryOptions.cursor);
  }
  const snapshot = await query.get();
  const data: T[] = [];
  snapshot.forEach((doc) => {
    data.push(doc.data() as T);
  });
  return data;
}

export function recursiveWhere<T>(
  query: FirebaseFirestore.Query,
  where: QueryWhereOptions<T>,
): FirebaseFirestore.Query {
  if (where.$and) {
    for (const subWhere of where.$and) {
      query = recursiveWhere(query, subWhere);
    }
  }
  if (where.$or) {
    throw new Error("Not implemented");
  }
  if (where.$not) {
    throw new Error("Not implemented");
  }
  if (where.$ge) {
    for (const key in where.$ge) {
      query = query.where(key, ">=", where.$ge[key]);
    }
  }
  if (where.$gt) {
    for (const key in where.$gt) {
      query = query.where(key, ">", where.$gt[key]);
    }
  }
  if (where.$le) {
    for (const key in where.$le) {
      query = query.where(key, "<=", where.$le[key]);
    }
  }
  if (where.$lt) {
    for (const key in where.$lt) {
      query = query.where(key, "<", where.$lt[key]);
    }
  }
  if (where.$in) {
    for (const key in where.$in) {
      query = query.where(key, "in", where.$in[key]);
    }
  }
  for (const key in where) {
    if (key[0] !== "$") {
      query = query.where(key, "==", where[key as keyof T]);
    }
  }
  return query;
}
