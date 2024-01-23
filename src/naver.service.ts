import { NAVER_ERROR } from "./my-error";

export class NaverService {
  validate(): string {
    const random = Math.random();
    if (random > 0.5) {
      throw new Error(NAVER_ERROR);
    }
    return "Hello User!";
  }
}
