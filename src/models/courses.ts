class Courses {
    //Fields
    subject: string;
    classNumber: number;
    title: string;
    term: string;
    instructorId: number;

    constructor(subject: string, classNumber: number, title: string, term: string, instructorId: number,) {
        this.subject = subject;
        this.classNumber = classNumber;
        this.title = title;
        this.term = term;
        this.instructorId = instructorId;
    }
}