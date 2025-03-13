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
import { CommandErrorHelper } from "@ledgerhq/signer-utils";
import { Just, Maybe, Nothing } from "purify-ts";

import { type Signature } from "@api/model/Signature";

import {
  SUI_APP_ERRORS,
  SuiAppCommandErrorFactory,
  type SuiAppErrorCodes,
} from "./utils/SuiApplicationErrors";

const SIGNATURE_LENGTH = 64;

export type SignTransactionCommandResponse = Maybe<Signature>;
export type SignTransactionCommandArgs = {
  /**
   * Chunked serialized transaction
   */
  readonly serializedTransaction: Uint8Array;
};

export class SignTransactionCommand
  implements
    Command<
      SignTransactionCommandResponse,
      SignTransactionCommandArgs,
      SuiAppErrorCodes
    >
{
  private readonly errorHelper = new CommandErrorHelper<
    SignTransactionCommandResponse,
    SuiAppErrorCodes
  >(SUI_APP_ERRORS, SuiAppCommandErrorFactory);

  args: SignTransactionCommandArgs;

  constructor(args: SignTransactionCommandArgs) {
    this.args = args;
  }

  getApdu(): Apdu {
    const { serializedTransaction } = this.args;
    const signTransactionArgs: ApduBuilderArgs = {
      cla: 0x00,
      ins: 0x03,
      p1: 0x00,
      p2: 0x00,
    };

    return new ApduBuilder(signTransactionArgs)
      .addBufferToData(serializedTransaction)
      .build();
  }

  parseResponse(
    response: ApduResponse,
  ): CommandResult<SignTransactionCommandResponse, SuiAppErrorCodes> {
    return Maybe.fromNullable(
      this.errorHelper.getError(response),
    ).orDefaultLazy(() => {
      const parser = new ApduParser(response);

      if (parser.getUnparsedRemainingLength() === 0) {
        return CommandResultFactory({
          data: Nothing,
        });
      }

      const signature = parser.extractFieldByLength(SIGNATURE_LENGTH);
      if (!signature) {
        return CommandResultFactory({
          error: new InvalidStatusWordError("Signature is missing"),
        });
      }

      return CommandResultFactory({
        data: Just(signature),
      });
    });
  }
}
