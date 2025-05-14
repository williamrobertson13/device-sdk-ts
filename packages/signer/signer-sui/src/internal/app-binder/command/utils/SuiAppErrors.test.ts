import { DeviceExchangeError } from "@ledgerhq/device-management-kit";

import {
  SUI_APP_ERRORS,
  SuiAppCommandError,
  type SuiAppErrorCodes,
} from "./SuiApplicationErrors";

describe("SuiAppCommandError", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should be an instance of DeviceExchangeError", () => {
    const error = new SuiAppCommandError({
      message: "Test error message",
      errorCode: "6700",
    });

    expect(error).toBeInstanceOf(DeviceExchangeError);
  });

  it("should set the correct message when provided", () => {
    const customMessage = "Custom error message";
    const error = new SuiAppCommandError({
      message: customMessage,
      errorCode: "6700",
    });

    expect(error.message).toBe(customMessage);
  });

  it("should set the correct customErrorCode", () => {
    const errorCode: SuiAppErrorCodes = "6a80";
    const error = new SuiAppCommandError({
      message: "Invalid data",
      errorCode,
    });

    expect(error.errorCode).toBe(errorCode);
  });

  it("should correlate error codes with messages from suiAppErrors", () => {
    const errorCode: SuiAppErrorCodes = "6b00";
    const expectedMessage = SUI_APP_ERRORS[errorCode].message;

    const error = new SuiAppCommandError({
      message: expectedMessage,
      errorCode,
    });

    expect(error.errorCode).toBe(errorCode);
    expect(error.message).toBe(expectedMessage);

    expect(error).toBeInstanceOf(DeviceExchangeError);
  });
});
