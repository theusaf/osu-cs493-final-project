class Assignment {
    //Fields
    courseId: number;
    title: string;
    points: number;
    due: string; //Date,

    constructor(courseId: number, title: string, points: number, due: string,) {
        this.courseId = courseId;
        this.title = title;
        this.points = points;
        this.due = due;
    }
}