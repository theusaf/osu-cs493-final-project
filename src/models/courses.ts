import { Model, ModelType } from "./model.js"

export interface CourseType extends ModelType {
    subject: string;
    classNumber: number;
    title: string;
    term: string;
    instructorId: number;
}


class Courses extends Model implements CourseType {
    //Fields
    subject: string;
    classNumber: number;
    title: string;
    term: string;
    instructorId: number;

    constructor(data: CourseType) {
        super(data.id)
        this.subject = data.subject;
        this.classNumber = data.classNumber;
        this.title = data.title;
        this.term = data.term;
        this.instructorId = data.instructorId;
    }
}