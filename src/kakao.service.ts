import { KAKAO_ERROR } from "./my-error";

export class KakaoService {
  validate(): string {
    const random = Math.random();
    if (random > 0.5) {
      throw new Error(KAKAO_ERROR);
    }
    return "Hello User!";
  }
}
