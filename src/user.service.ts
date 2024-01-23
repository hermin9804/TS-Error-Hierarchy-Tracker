import { CatService } from "./cat.service";
import { USER_EXISTS, USER_NOT_FOUND } from "./my-error";

export class UserService {
  constructor() {}

  findUser(): string {
    return this.findUserDependency();
  }

  findUserDependency(): string {
    const random = Math.random();
    if (random > 0.5) {
      throw new Error(USER_EXISTS);
    } else if (random > 0.25) {
      throw new Error(USER_NOT_FOUND);
    }
    return "Hello User!";
  }
}
