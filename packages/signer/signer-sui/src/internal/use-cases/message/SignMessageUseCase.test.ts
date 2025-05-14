import { type SuiAppBinder } from "@internal/app-binder/SuiAppBinder";

import { SignMessageUseCase } from "./SignMessageUseCase";

describe("SignMessageUseCase", () => {
  it("should call signMessage on appBinder with the correct arguments", () => {
    // Given
    const derivationPath = "44'/501'/0'/0'";
    const message = "Hello world";
    const appBinder = {
      signMessage: vi.fn(),
    };
    const signMessageUseCase = new SignMessageUseCase(
      appBinder as unknown as SuiAppBinder,
    );

    // When
    signMessageUseCase.execute(derivationPath, message);

    // Then
    expect(appBinder.signMessage).toHaveBeenCalledWith({
      derivationPath,
      message,
    });
  });
});
