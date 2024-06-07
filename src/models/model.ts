import { connection } from "../firebase.js";
import { FirestoreCollection } from "../util/constants.js";

export interface ModelType {
  id: string;
}

export abstract class Model {
  id: string;
  #table: FirestoreCollection;

  constructor(id: string, table: FirestoreCollection) {
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
        .add(this.toJSON());
      this.id = docRef.id;
      await connection.collection(this.#table).doc(this.id).set(this.toJSON());
    } else {
      await connection.collection(this.#table).doc(this.id).set(this.toJSON());
    }
  }
}
