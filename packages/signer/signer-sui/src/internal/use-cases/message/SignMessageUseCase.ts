import { inject, injectable } from "inversify";

import { SignMessageDAReturnType } from "@api/app-binder/SignMessageDeviceActionTypes";
import { appBinderTypes } from "@internal/app-binder/di/appBinderTypes";
import { type SuiAppBinder } from "@internal/app-binder/SuiAppBinder";

@injectable()
export class SignMessageUseCase {
  private _appBinder: SuiAppBinder;

  constructor(
    @inject(appBinderTypes.AppBinder)
    appBinding: SuiAppBinder,
  ) {
    this._appBinder = appBinding;
  }

  execute(derivationPath: string, message: string): SignMessageDAReturnType {
    return this._appBinder.signMessage({
      derivationPath,
      message,
    });
  }
}
