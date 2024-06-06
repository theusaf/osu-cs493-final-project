import { Model, ModelType } from "./model.js"

export interface SubmissionType extends ModelType {
    assignmentId: number;
    studentId: number;
    timestamp: string; //Date
    grade: number;
    file: string;
}




export class Submission extends Model implements SubmissionType {
    //Fields
    assignmentId: number;
    studentId: number;
    timestamp: string; //Date
    grade: number;
    file: string;

    constructor(data: SubmissionType) {
        super(data.id);
        this.assignmentId = data.assignmentId;
        this.studentId = data.studentId;
        this.timestamp = data.timestamp;
        this.grade = data.grade;
        this.file = data.file;
    }
}