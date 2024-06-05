class Submission {
    //Fields
    assignmentId: number;
    studentId: number;
    timestamp: string; //Date
    grade: number;
    file: string;

    constructor(assignmentId: number, studentId: number, timestamp: string, grade: number, file: string,) {
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.timestamp = timestamp;
        this.grade = grade;
        this.file = file;
    }
}