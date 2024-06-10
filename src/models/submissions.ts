import { connection, executeQuery, storage } from "../firebase.js";
import { QueryOptions } from "../types/database.js";
import { FirestoreCollection } from "../util/constants.js";
import { Model, ModelType } from "./model.js";
export interface SubmissionType extends ModelType {
  assignmentId: string;
  studentId: string;
  timestamp: string; //Date
  grade: number;
  file: Buffer;
  type: string;
  fileName: string;
  fileURL: string;
}

export class Submission extends Model implements SubmissionType {
  assignmentId: string;
  studentId: string;
  timestamp: string; //Date
  grade: number;
  file: Buffer;
  type: string;
  fileName: string;
  fileURL: string;

  constructor(data: SubmissionType) {
    super(data.id, FirestoreCollection.SUBMISSIONS);
    this.assignmentId = data.assignmentId ?? "";
    this.studentId = data.studentId ?? "";
    this.timestamp = data.timestamp ?? new Date(0).toISOString();
    this.grade = data.grade ?? 0;
    this.file = data.file ?? Buffer.from("");
    this.type = data.type ?? "";
    this.fileName = data.fileName ?? "";
    this.fileURL = data.fileURL ?? "";
  }

  toJSON(): Omit<SubmissionType, "file" | "type" | "fileName"> {
    return {
      id: this.id,
      assignmentId: this.assignmentId,
      studentId: this.studentId,
      timestamp: this.timestamp,
      grade: this.grade,
      fileURL: this.fileURL,
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

  static async saveFileToStorage(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const bucket = storage.bucket();
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: contentType,
      },
      resumable: false,
    });

    await new Promise<void>((resolve, reject) => {
      stream.on("error", (err) => {
        reject(err);
      });

      stream.on("finish", () => {
        resolve();
      });

      stream.end(fileBuffer);
    });

    await file.makePublic();
    const url = file.publicUrl();
    return url;
  }

  async save() {
    this.fileURL = await Submission.saveFileToStorage(
      this.file,
      this.fileName,
      this.type,
    );
    await super.save();
  }
}
