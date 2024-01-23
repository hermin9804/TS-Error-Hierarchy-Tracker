import { CatService } from "./cat.service";
import { UserService } from "./user.service";
import { APP_ERROR } from "./my-error";
import { SnsService } from "./sns.service";

export class AppService {
  constructor(
    private readonly catService: CatService,
    private readonly userService: UserService,
    private readonly snsService: SnsService
  ) {}

  findUser(): string {
    // if (Math.random() > 0.5) {
    //   throw new Error(APP_ERROR);
    // }
    return this.userService.findUser();
    // return this.findCat();
  }

  findCat(): string {
    return this.catService.findCat();
    // return this.findUser();
  }

  snsLogin(): string {
    return this.snsService.validate("kakao");
  }
}
