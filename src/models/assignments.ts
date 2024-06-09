import { connection, executeQuery } from "../firebase.js";
import { QueryOptions } from "../types/database.js";
import { FirestoreCollection } from "../util/constants.js";
import { Model, ModelType } from "./model.js";

export interface AssignmentType extends ModelType {
  courseId: string;
  title: string;
  points: number;

  /**
   * The due date as an ISO 8601 date string
   */
  due: string;
}

export class Assignment extends Model implements AssignmentType {
  courseId: string;
  title: string;
  points: number;
  due: string;

  constructor(data: AssignmentType) {
    super(data.id, FirestoreCollection.ASSIGNMENTS);
    this.courseId = data.courseId;
    this.title = data.title ?? "";
    this.points = data.points ?? 0;
    this.due = data.due ?? new Date(0).toISOString();
  }

  toJSON(): AssignmentType {
    return {
      id: this.id,
      courseId: this.courseId,
      title: this.title,
      points: this.points,
      due: this.due,
    };
  }

  static async findById(id: string): Promise<Assignment> {
    return (await Assignment.findAll({ where: { id }, limit: 1 }))[0];
  }

  static async findAll(
    options?: QueryOptions<AssignmentType>,
  ): Promise<Assignment[]> {
    const query = connection.collection(FirestoreCollection.ASSIGNMENTS);
    return (await executeQuery<AssignmentType>(query, options)).map((data) => {
      return new Assignment(data);
    });
  }
}
