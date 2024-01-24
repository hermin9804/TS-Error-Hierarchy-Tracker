import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnsAuthModule } from './sns-auth/sns-auth.module';

@Module({
  imports: [SnsAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
