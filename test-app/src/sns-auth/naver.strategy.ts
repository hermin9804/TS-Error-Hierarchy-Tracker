import { Injectable } from '@nestjs/common';

@Injectable()
export class NaverStrategy {
  validate(): string {
    throw new Error('NaverStrategy Error!!');
  }
}
