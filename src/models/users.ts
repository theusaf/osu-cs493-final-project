import { Model, ModelType } from "./model.js"

export interface UserType extends ModelType {
    //Fields
    name: string;
    email: string;
    password: string;
    role: string;
}


export class Users extends Model implements UserType {
    //Fields
    name: string;
    email: string;
    password: string;
    role: string;

    constructor(data: UserType) {
        super(data.id)
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
    }
}
