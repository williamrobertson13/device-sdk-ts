import { inject, injectable } from "inversify";

import { SignTransactionDAReturnType } from "@api/app-binder/SignTransactionDeviceActionTypes";
import { Transaction } from "@api/model/Transaction";
import { TransactionOptions } from "@api/model/TransactionOptions";
import { appBinderTypes } from "@internal/app-binder/di/appBinderTypes";
import { SuiAppBinder } from "@internal/app-binder/SuiAppBinder";

@injectable()
export class SignTransactionUseCase {
  constructor(
    @inject(appBinderTypes.AppBinder) private appBinder: SuiAppBinder,
  ) {}

  execute(
    derivationPath: string,
    transaction: Transaction,
    options?: TransactionOptions,
  ): SignTransactionDAReturnType {
    return this.appBinder.signTransaction({
      derivationPath,
      transaction,
      options,
    });
  }
}
