import { CAT_EXISTS, CAT_NOT_FOUND } from "./my-error";

export class CatService {
  findCat(): string {
    const random = Math.random();
    if (random > 0.5) {
      throw new Error(CAT_EXISTS);
    } else if (random > 0.25) {
      throw new Error(CAT_NOT_FOUND);
    }
    return "Hello User!";
  }
}
