import {
  type Apdu,
  ApduBuilder,
  type ApduBuilderArgs,
  ApduParser,
  type ApduResponse,
  type Command,
  type CommandResult,
  CommandResultFactory,
  InvalidStatusWordError,
} from "@ledgerhq/device-management-kit";
import {
  CommandErrorHelper,
  DerivationPathUtils,
} from "@ledgerhq/signer-utils";
import { Maybe } from "purify-ts";

import { type PublicKey } from "@api/model/PublicKey";

import {
  SUI_APP_ERRORS,
  SuiAppCommandErrorFactory,
  type SuiAppErrorCodes,
} from "./utils/SuiApplicationErrors";

type GetPubKeyCommandResponse = PublicKey;
type GetPubKeyCommandArgs = {
  derivationPath: string;
  checkOnDevice: boolean;
};

export class GetPubKeyCommand
  implements
    Command<GetPubKeyCommandResponse, GetPubKeyCommandArgs, SuiAppErrorCodes>
{
  private readonly errorHelper = new CommandErrorHelper<
    GetPubKeyCommandResponse,
    SuiAppErrorCodes
  >(SUI_APP_ERRORS, SuiAppCommandErrorFactory);

  args: GetPubKeyCommandArgs;

  constructor(args: GetPubKeyCommandArgs) {
    this.args = args;
  }

  getApdu(): Apdu {
    const getPubKeyArgs: ApduBuilderArgs = {
      cla: 0x00,
      ins: this.args.checkOnDevice ? 0x01 : 0x02,
      p1: 0x00,
      p2: 0x00,
    };

    const builder = new ApduBuilder(getPubKeyArgs);
    const derivationPath = this.args.derivationPath;

    const path = DerivationPathUtils.splitPath(derivationPath);
    builder.add8BitUIntToData(path.length);
    path.forEach((element) => builder.add32BitUIntToData(element));

    return builder.build();
  }

  parseResponse(
    response: ApduResponse,
  ): CommandResult<GetPubKeyCommandResponse, SuiAppErrorCodes> {
    return Maybe.fromNullable(
      this.errorHelper.getError(response),
    ).orDefaultLazy(() => {
      const parser = new ApduParser(response);
      const publicKeySize = parser.extract8BitUInt();

      if (publicKeySize === undefined) {
        return CommandResultFactory({
          error: new InvalidStatusWordError("Public key is missing"),
        });
      }

      if (!parser.testMinimalLength(publicKeySize)) {
        return CommandResultFactory({
          error: new InvalidStatusWordError("Public key is invalid"),
        });
      }

      const buffer = parser.extractFieldByLength(publicKeySize);
      if (buffer === undefined) {
        return CommandResultFactory({
          error: new InvalidStatusWordError("Unable to extract public key"),
        });
      }

      return CommandResultFactory({
        data: buffer,
      });
    });
  }
}
