import { Injectable } from '@nestjs/common';

@Injectable()
export class KakaoStrategy {
  validate(): string {
    throw new Error('KakaoStrategy Error!!');
  }
}
