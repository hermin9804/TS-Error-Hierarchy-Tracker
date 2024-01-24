import { Injectable } from '@nestjs/common';
import { SnsAuthService } from './sns-auth/sns-auth.service';

@Injectable()
export class AppService {
  constructor(private readonly snsAuthService: SnsAuthService) {}

  snsLogin(snsProvider: string): string {
    return this.snsAuthService.validate(snsProvider);
  }
}
