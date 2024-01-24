import { Injectable } from '@nestjs/common';
import { KakaoStrategy } from './kakao.strategy';
import { NaverStrategy } from './naver.strategy';

@Injectable()
export class SnsAuthService {
  constructor(
    private readonly kakaoStrategy: KakaoStrategy,
    private readonly naverStrategy: NaverStrategy,
  ) {}

  validate(snsProvider: string): string {
    if (snsProvider === 'kakao') {
      return this.kakaoStrategy.validate();
    } else if (snsProvider === 'naver') {
      return this.naverStrategy.validate();
    }
    throw new Error('Not supported sns provider');
  }
}
