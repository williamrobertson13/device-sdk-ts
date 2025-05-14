import {
  type DeviceActionState,
  DeviceActionStatus,
  type DeviceManagementKit,
  type DeviceSessionId,
  SendCommandInAppDeviceAction,
  UserInteractionRequired,
} from "@ledgerhq/device-management-kit";
import { from } from "rxjs";

import {
  type GetAppConfigurationDAError,
  type GetAppConfigurationDAIntermediateValue,
  type GetAppConfigurationDAOutput,
} from "@api/app-binder/GetAppConfigurationDeviceActionTypes";
import {
  type GetAddressDAError,
  type GetAddressDAIntermediateValue,
  type GetAddressDAOutput,
  type SignTransactionDAError,
  type SignTransactionDAIntermediateValue,
  type SignTransactionDAOutput,
} from "@api/index";

import { GetAppConfigurationCommand } from "./command/GetAppConfigurationCommand";
import { GetPubKeyCommand } from "./command/GetPubKeyCommand";
import { SignTransactionDeviceAction } from "./device-action/SignTransactionDeviceAction";
import { SuiAppBinder } from "./SuiAppBinder";

describe("SuiAppBinder", () => {
  const mockedDmk: DeviceManagementKit = {
    sendCommand: vi.fn(),
    executeDeviceAction: vi.fn(),
  } as unknown as DeviceManagementKit;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    const binder = new SuiAppBinder(
      {} as DeviceManagementKit,
      {} as DeviceSessionId,
    );
    expect(binder).toBeDefined();
  });

  describe("getAddress", () => {
    it("should return the address", () =>
      new Promise<void>((resolve, reject) => {
        // GIVEN
        const address = new Uint8Array([]); //"D2PPQSYFe83nDzk96FqGumVU8JA7J8vj2Rhjc2oXzEi5";

        vi.spyOn(mockedDmk, "executeDeviceAction").mockReturnValue({
          observable: from([
            {
              status: DeviceActionStatus.Completed,
              output: address,
            } as DeviceActionState<
              GetAddressDAOutput,
              GetAddressDAError,
              GetAddressDAIntermediateValue
            >,
          ]),
          cancel: vi.fn(),
        });

        // WHEN
        const appBinder = new SuiAppBinder(mockedDmk, "sessionId");
        const { observable } = appBinder.getAddress({
          derivationPath: "44'/784'/0'/0'/0'",
          checkOnDevice: false,
        });

        // THEN
        const states: DeviceActionState<
          GetAddressDAOutput,
          GetAddressDAError,
          GetAddressDAIntermediateValue
        >[] = [];
        observable.subscribe({
          next: (state) => {
            states.push(state);
          },
          error: (err) => {
            reject(err);
          },
          complete: () => {
            try {
              expect(states).toEqual([
                {
                  status: DeviceActionStatus.Completed,
                  output: address,
                },
              ]);
              resolve();
            } catch (err) {
              reject(err as Error);
            }
          },
        });
      }));

    describe("calls of executeDeviceAction with the correct params", () => {
      const baseParams = {
        derivationPath: "44'/60'/3'/2/1",
        returnChainCode: false,
      };

      it("when checkOnDevice is true: UserInteractionRequired.VerifyAddress", () => {
        // GIVEN
        const checkOnDevice = true;
        const params = {
          ...baseParams,
          checkOnDevice,
        };

        // WHEN
        const appBinder = new SuiAppBinder(mockedDmk, "sessionId");
        appBinder.getAddress(params);

        // THEN
        expect(mockedDmk.executeDeviceAction).toHaveBeenCalledWith({
          sessionId: "sessionId",
          deviceAction: new SendCommandInAppDeviceAction({
            input: {
              command: new GetPubKeyCommand(params),
              appName: "Sui",
              requiredUserInteraction: UserInteractionRequired.VerifyAddress,
            },
          }),
        });
      });

      it("when checkOnDevice is false: UserInteractionRequired.None", () => {
        // GIVEN
        const checkOnDevice = false;
        const params = {
          ...baseParams,
          checkOnDevice,
        };

        // WHEN
        const appBinder = new SuiAppBinder(mockedDmk, "sessionId");
        appBinder.getAddress(params);

        // THEN
        expect(mockedDmk.executeDeviceAction).toHaveBeenCalledWith({
          sessionId: "sessionId",
          deviceAction: new SendCommandInAppDeviceAction({
            input: {
              command: new GetPubKeyCommand(params),
              appName: "Sui",
              requiredUserInteraction: UserInteractionRequired.None,
            },
          }),
        });
      });
    });
  });

  describe("signTransaction", () => {
    it("should return the signature", () =>
      new Promise<void>((resolve, reject) => {
        // GIVEN
        const signature = new Uint8Array([0x01, 0x02, 0x03]);

        vi.spyOn(mockedDmk, "executeDeviceAction").mockReturnValue({
          observable: from([
            {
              status: DeviceActionStatus.Completed,
              output: signature,
            } as DeviceActionState<
              SignTransactionDAOutput,
              SignTransactionDAError,
              SignTransactionDAIntermediateValue
            >,
          ]),
          cancel: vi.fn(),
        });

        // WHEN
        const appBinder = new SuiAppBinder(mockedDmk, "sessionId");
        const { observable } = appBinder.signTransaction({
          derivationPath: "44'/784'/0'/0'/0'",
          transaction: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
        });

        // THEN
        const states: DeviceActionState<
          SignTransactionDAOutput,
          SignTransactionDAError,
          SignTransactionDAIntermediateValue
        >[] = [];
        observable.subscribe({
          next: (state) => {
            states.push(state);
          },
          error: (err) => {
            reject(err);
          },
          complete: () => {
            try {
              expect(states).toEqual([
                {
                  status: DeviceActionStatus.Completed,
                  output: signature,
                },
              ]);
              resolve();
            } catch (err) {
              reject(err as Error);
            }
          },
        });
      }));

    it("should call executeDeviceAction with the correct params", () => {
      // GIVEN
      const derivationPath = "44'/60'/3'/2/1";
      const transaction = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

      // WHEN
      const appBinder = new SuiAppBinder(mockedDmk, "sessionId");
      appBinder.signTransaction({ derivationPath, transaction });

      // THEN
      expect(mockedDmk.executeDeviceAction).toHaveBeenCalledWith({
        deviceAction: new SignTransactionDeviceAction({
          input: {
            derivationPath,
            transaction,
            options: {},
          },
        }),
        sessionId: "sessionId",
      });
    });
  });

  describe("getAppConfiguration", () => {
    it("should return the app configuration", () =>
      new Promise<void>((resolve, reject) => {
        // GIVEN
        const appConfiguration = {
          version: "0.2.3",
        };

        vi.spyOn(mockedDmk, "executeDeviceAction").mockReturnValue({
          observable: from([
            {
              status: DeviceActionStatus.Completed,
              output: appConfiguration,
            } as DeviceActionState<
              GetAppConfigurationDAOutput,
              GetAppConfigurationDAError,
              GetAppConfigurationDAIntermediateValue
            >,
          ]),
          cancel: vi.fn(),
        });

        // WHEN
        const appBinder = new SuiAppBinder(mockedDmk, "sessionId");
        const { observable } = appBinder.getAppConfiguration();

        // THEN
        const states: DeviceActionState<
          GetAppConfigurationDAOutput,
          GetAppConfigurationDAError,
          GetAppConfigurationDAIntermediateValue
        >[] = [];

        observable.subscribe({
          next: (state) => {
            states.push(state);
          },
          error: (err) => {
            reject(err);
          },
          complete: () => {
            try {
              expect(states).toEqual([
                {
                  status: DeviceActionStatus.Completed,
                  output: appConfiguration,
                },
              ]);
              resolve();
            } catch (err) {
              reject(err as Error);
            }
          },
        });
      }));

    it("should call executeDeviceAction with the correct params", () => {
      // GIVEN
      const appBinder = new SuiAppBinder(mockedDmk, "sessionId");

      // WHEN
      appBinder.getAppConfiguration();

      // THEN
      expect(mockedDmk.executeDeviceAction).toHaveBeenCalledWith({
        sessionId: "sessionId",
        deviceAction: new SendCommandInAppDeviceAction({
          input: {
            command: new GetAppConfigurationCommand(), // Correct command
            appName: "Sui",
            requiredUserInteraction: UserInteractionRequired.None,
          },
        }),
      });
    });
  });
});
