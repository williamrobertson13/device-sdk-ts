import {
  type DeviceManagementKit,
  type DeviceSessionId,
} from "@ledgerhq/device-management-kit";

import { DefaultSignerSui } from "./DefaultSignerSui";

describe("DefaultSignerSui", () => {
  it("should be defined", () => {
    const signer = new DefaultSignerSui({
      dmk: {} as DeviceManagementKit,
      sessionId: {} as DeviceSessionId,
    });
    expect(signer).toBeDefined();
  });

  it("should call getAddress", () => {
    const dmk = {
      executeDeviceAction: vi.fn(),
    } as unknown as DeviceManagementKit;
    const sessionId = {} as DeviceSessionId;
    const signer = new DefaultSignerSui({ dmk, sessionId });
    signer.getAddress("derivationPath", {});
    expect(dmk.executeDeviceAction).toHaveBeenCalled();
  });

  it("should call signTransaction", () => {
    const dmk = {
      executeDeviceAction: vi.fn(),
    } as unknown as DeviceManagementKit;
    const sessionId = {} as DeviceSessionId;
    const signer = new DefaultSignerSui({ dmk, sessionId });
    signer.signTransaction("derivationPath", new Uint8Array(), {});
    expect(dmk.executeDeviceAction).toHaveBeenCalled();
  });

  it("should call getAppConfiguration", () => {
    const dmk = {
      executeDeviceAction: vi.fn(),
    } as unknown as DeviceManagementKit;
    const sessionId = {} as DeviceSessionId;
    const signer = new DefaultSignerSui({ dmk, sessionId });
    signer.getAppConfiguration();
    expect(dmk.executeDeviceAction).toHaveBeenCalled();
  });
});
