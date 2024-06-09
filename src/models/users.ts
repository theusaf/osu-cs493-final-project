import { connection, executeQuery } from "../firebase.js";
import { QueryOptions } from "../types/database.js";
import { FirestoreCollection } from "../util/constants.js";
import { Model, ModelType } from "./model.js";

export interface UserType extends ModelType {
  name: string;
  email: string;
  password: string;
  role: "admin" | "student" | "instructor";
}

export class User extends Model implements UserType {
  name: string;
  email: string;
  password: string;
  role: "admin" | "student" | "instructor";

  constructor(data: UserType) {
    super(data.id, FirestoreCollection.USERS);
    this.name = data.name ?? "";
    this.email = data.email ?? "";
    this.password = data.password ?? "";
    this.role = data.role ?? "student";
  }

  toJSON(): UserType {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    };
  }

  static async findById(id: string): Promise<User> {
    return (await User.findAll({ where: { id }, limit: 1 }))[0];
  }

  static async findAll(options?: QueryOptions<UserType>): Promise<User[]> {
    const query = connection.collection(FirestoreCollection.USERS);
    return (await executeQuery<UserType>(query, options)).map((data) => {
      return new User(data);
    });
  }
}
