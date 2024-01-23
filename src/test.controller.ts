import { AppService } from "./app.service";
import { HandleError } from "./handelError";
import { CAT_EXISTS, CAT_NOT_FOUND, USER_EXISTS } from "./my-error";

export class TestController {
  constructor(private readonly appService: AppService) {}

  @HandleError(USER_EXISTS)
  getUser(): string {
    return this.appService.findUser();
  }

  @HandleError(CAT_EXISTS)
  getCat(): string {
    return this.appService.findCat();
  }
}
