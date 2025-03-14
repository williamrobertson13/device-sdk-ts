import {
  type DeviceManagementKit,
  type DeviceSessionId,
} from "@ledgerhq/device-management-kit";

import { DefaultSignerSui } from "@internal/DefaultSignerSui";

type SignerSuiBuilderConstructorArgs = {
  dmk: DeviceManagementKit;
  sessionId: DeviceSessionId;
};

/**
 * Builder for the `SignerSui` class.
 *
 * @example
 * ```
 * const signer = new SignerSuiBuilder({ dmk, sessionId })
 *  .build();
 * ```
 */
export class SignerSuiBuilder {
  private _dmk: DeviceManagementKit;
  private _sessionId: DeviceSessionId;

  constructor({ dmk, sessionId }: SignerSuiBuilderConstructorArgs) {
    this._dmk = dmk;
    this._sessionId = sessionId;
  }

  /**
   * Build the Sui signer
   *
   * @returns the Sui signer
   */
  public build() {
    return new DefaultSignerSui({
      dmk: this._dmk,
      sessionId: this._sessionId,
    });
  }
}
