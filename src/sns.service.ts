import { KakaoService } from "./kakao.service";
import { NaverService } from "./naver.service";

export class SnsService {
  constructor(
    private readonly kakaoService: KakaoService,
    private readonly naverService: NaverService
  ) {}

  validate(provider: string): string {
    if (provider === "kakao") {
      return this.kakaoService.validate();
    } else if (provider === "naver") {
      return this.naverService.validate();
    }
    return "Hello User!";
  }
}
