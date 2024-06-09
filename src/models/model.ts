import { connection } from "../firebase.js";
import { FirestoreCollection } from "../util/constants.js";

export interface ModelType {
  id?: string;
}

export abstract class Model {
  id: string | undefined;
  #table: FirestoreCollection;

  constructor(id: string | undefined, table: FirestoreCollection) {
    this.id = id;
    this.#table = table;
  }

  abstract toJSON(): any;

  async delete(): Promise<void> {
    if (!this.id) return;
    await connection.collection(this.#table).doc(this.id).delete();
  }

  async save(): Promise<void> {
    if (!this.id) {
      const docRef = await connection
        .collection(this.#table)
        .add(this.#sanitize(this.toJSON()));
      this.id = docRef.id;
      await connection
        .collection(this.#table)
        .doc(this.id)
        .set(this.#sanitize(this.toJSON()));
    } else {
      await connection
        .collection(this.#table)
        .doc(this.id)
        .set(this.#sanitize(this.toJSON()));
    }
  }

  #sanitize(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        sanitized[key] = data[key];
      }
    }
    return sanitized;
  }
}
