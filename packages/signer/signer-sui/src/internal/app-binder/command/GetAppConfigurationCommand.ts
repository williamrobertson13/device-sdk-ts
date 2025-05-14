import {
  type Apdu,
  ApduBuilder,
  ApduParser,
  type ApduResponse,
  type Command,
  type CommandResult,
  CommandResultFactory,
  InvalidStatusWordError,
} from "@ledgerhq/device-management-kit";
import { CommandErrorHelper } from "@ledgerhq/signer-utils";
import { Maybe } from "purify-ts";

import { type AppConfiguration } from "@api/model/AppConfiguration";

import {
  SUI_APP_ERRORS,
  SuiAppCommandErrorFactory,
  type SuiAppErrorCodes,
} from "./utils/SuiApplicationErrors";

type GetAppConfigurationCommandArgs = void;

export class GetAppConfigurationCommand
  implements
    Command<AppConfiguration, GetAppConfigurationCommandArgs, SuiAppErrorCodes>
{
  private readonly errorHelper = new CommandErrorHelper<
    AppConfiguration,
    SuiAppErrorCodes
  >(SUI_APP_ERRORS, SuiAppCommandErrorFactory);

  args: GetAppConfigurationCommandArgs;

  constructor(args: GetAppConfigurationCommandArgs) {
    this.args = args;
  }

  getApdu(): Apdu {
    return new ApduBuilder({
      cla: 0x00,
      ins: 0x00,
      p1: 0x00,
      p2: 0x00,
    }).build();
  }

  parseResponse(
    response: ApduResponse,
  ): CommandResult<AppConfiguration, SuiAppErrorCodes> {
    return Maybe.fromNullable(
      this.errorHelper.getError(response),
    ).orDefaultLazy(() => {
      const parser = new ApduParser(response);
      const major = parser.extract8BitUInt();
      const minor = parser.extract8BitUInt();
      const patch = parser.extract8BitUInt();

      if (major === undefined || minor === undefined || patch === undefined) {
        return CommandResultFactory({
          error: new InvalidStatusWordError("Cannot extract version"),
        });
      }

      const config: AppConfiguration = {
        version: `${major}.${minor}.${patch}`,
      };

      return CommandResultFactory({
        data: config,
      });
    });
  }
}
