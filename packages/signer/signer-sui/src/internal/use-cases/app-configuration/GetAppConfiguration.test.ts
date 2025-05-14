import { type AppConfiguration } from "@api/model/AppConfiguration";
import { type SuiAppBinder } from "@internal/app-binder/SuiAppBinder";

import { GetAppConfigurationUseCase } from "./GetAppConfigurationUseCase";

describe("GetAppConfigurationUseCase", () => {
  const getAppConfigurationMock = vi.fn();
  const config: AppConfiguration = {
    version: "1.0.0",
  };
  const appBinderMock = {
    getAppConfiguration: getAppConfigurationMock,
  } as unknown as SuiAppBinder;
  let useCase: GetAppConfigurationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetAppConfigurationUseCase(appBinderMock);
  });

  it("should return the config from the appBinder's getAppConfiguration method", () => {
    // GIVEN
    getAppConfigurationMock.mockReturnValue(config);

    // WHEN
    const result = useCase.execute();

    // THEN
    expect(getAppConfigurationMock).toHaveBeenCalledWith();
    expect(result).toEqual(config);
  });
});
