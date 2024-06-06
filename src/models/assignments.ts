import { Model, ModelType } from "./model.js"

export interface AssignmentType extends ModelType {
    //Fields
    courseId: number;
    title: string;
    points: number;
    due: string; //Date,
}

class Assignment extends Model implements AssignmentType {
    courseId: number;
    title: string;
    points: number;
    due: string;

    constructor(data: AssignmentType) {
        super(data.id)
        this.courseId = data.courseId;
        this.title = data.title;
        this.points = data.points;
        this.due = data.due;
    }
}
