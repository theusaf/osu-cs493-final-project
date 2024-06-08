import { connection, executeQuery } from "../firebase.js";
import { QueryOptions } from "../types/database.js";
import { FirestoreCollection } from "../util/constants.js";
import { Model, ModelType } from "./model.js";

export interface CourseType extends ModelType {
  subject: string;
  classNumber: string;
  title: string;
  term: string;
  instructorId: string;
  studentIds: string[];
}

export class Course extends Model implements CourseType {
  subject: string;
  classNumber: string;
  title: string;
  term: string;
  instructorId: string;
  studentIds: string[];

  constructor(data: CourseType) {
    super(data.id, FirestoreCollection.COURSES);
    this.subject = data.subject ?? "";
    this.classNumber = data.classNumber ?? "000";
    this.title = data.title ?? "";
    this.term = data.term ?? "";
    this.instructorId = data.instructorId ?? "000";
    this.studentIds = data.studentIds ?? [];
  }

  /**
   * Returns a JSON representation of the course.
   *
   * While internally, the number is stored as `classNumber`,
   * the JSON representation should use `number` according to spec.
   */
  toJSON(): Omit<CourseType, "classNumber"> & { number: string } {
    return {
      id: this.id,
      subject: this.subject,
      number: this.classNumber,
      title: this.title,
      term: this.term,
      instructorId: this.instructorId,
      studentIds: this.studentIds,
    };
  }

  static async findById(id: string): Promise<Course> {
    return (await Course.findAll({ where: { id }, limit: 1 }))[0];
  }

  static async findAll(options?: QueryOptions<CourseType>): Promise<Course[]> {
    const query = connection.collection(FirestoreCollection.COURSES);
    return (await executeQuery<CourseType>(query, options)).map((data) => {
      return new Course(data);
    });
  }
}
