import { Module } from '@nestjs/common';
import { SnsAuthService } from './sns-auth.service';
import { KakaoStrategy } from './kakao.strategy';
import { NaverStrategy } from './naver.strategy';

@Module({
  imports: [],
  controllers: [],
  providers: [SnsAuthService, KakaoStrategy, NaverStrategy],
  exports: [SnsAuthService],
})
export class SnsAuthModule {}
