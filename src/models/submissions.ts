import { connection, executeQuery } from "../firebase.js";
import { QueryOptions } from "../types/database.js";
import { FirestoreCollection } from "../util/constants.js";
import { Model, ModelType } from "./model.js";

export interface SubmissionType extends ModelType {
  assignmentId: string;
  studentId: string;
  timestamp: string; //Date
  grade: number;
  file: string;
}

export class Submission extends Model implements SubmissionType {
  assignmentId: string;
  studentId: string;
  timestamp: string; //Date
  grade: number;
  file: string;

  constructor(data: SubmissionType) {
    super(data.id, FirestoreCollection.SUBMISSIONS);
    this.assignmentId = data.assignmentId;
    this.studentId = data.studentId;
    this.timestamp = data.timestamp;
    this.grade = data.grade;
    this.file = data.file;
  }

  toJSON(): SubmissionType {
    return {
      id: this.id,
      assignmentId: this.assignmentId,
      studentId: this.studentId,
      timestamp: this.timestamp,
      grade: this.grade,
      file: this.file,
    };
  }

  static async findById(id: string): Promise<Submission> {
    return (await Submission.findAll({ where: { id }, limit: 1 }))[0];
  }

  static async findAll(
    options?: QueryOptions<SubmissionType>,
  ): Promise<Submission[]> {
    const query = connection.collection(FirestoreCollection.SUBMISSIONS);
    return (await executeQuery<SubmissionType>(query, options)).map((data) => {
      return new Submission(data);
    });
  }
}
