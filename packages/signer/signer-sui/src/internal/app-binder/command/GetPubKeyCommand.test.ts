import {
  ApduResponse,
  CommandResultFactory,
  isSuccessCommandResult,
} from "@ledgerhq/device-management-kit";

import { GetPubKeyCommand } from "./GetPubKeyCommand";

const GET_PUBKYEY_APDU_DEFAULT_PATH_WITH_CONFIRM = new Uint8Array([
  0x00, 0x01, 0x00, 0x00, 0x15, 0x05, 0x80, 0x00, 0x00, 0x2c, 0x80, 0x00, 0x03,
  0x10, 0x80, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00,
]);

const GET_PUBKYEY_APDU_DEFAULT_PATH_WITHOUT_CONFIRM = new Uint8Array([
  0x00, 0x02, 0x00, 0x00, 0x15, 0x05, 0x80, 0x00, 0x00, 0x2c, 0x80, 0x00, 0x03,
  0x10, 0x80, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00,
]);

const GET_PUBKEY_APDU_DIFFERENT_PATH = new Uint8Array([
  0x00, 0x01, 0x00, 0x00, 0x15, 0x05, 0x80, 0x00, 0x00, 0x2c, 0x80, 0x00, 0x03,
  0x10, 0x80, 0x00, 0x00, 0x01, 0x80, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00,
]);

// Public key bytes for valid key: 'Uz39UFseB/B38iBwjesIU1JZxY6y+TRL9P84JFw41W4='
const publicKeyBytes = new Uint8Array([
  83, 61, 253, 80, 91, 30, 7, 240, 119, 242, 32, 112, 141, 235, 8, 83, 82, 89,
  197, 142, 178, 249, 52, 75, 244, 255, 56, 36, 92, 56, 213, 110,
]);

const GET_PUBKEY_APDU = new Uint8Array([32, ...publicKeyBytes]);

const GET_PUBKEY_APDU_RESPONSE = new ApduResponse({
  statusCode: Uint8Array.from([0x90, 0x00]),
  data: GET_PUBKEY_APDU,
});

describe("GetPubKeyCommand", () => {
  let command: GetPubKeyCommand;
  const defaultArgs = {
    derivationPath: "44'/784'/0'/0'/0'",
    checkOnDevice: true,
  };

  beforeEach(() => {
    command = new GetPubKeyCommand(defaultArgs);
    vi.clearAllMocks();
    vi.importActual("@ledgerhq/device-management-kit");
  });

  describe("getApdu", () => {
    it("should return APDU", () => {
      const apdu = command.getApdu();

      expect(apdu.getRawApdu()).toEqual(
        GET_PUBKYEY_APDU_DEFAULT_PATH_WITH_CONFIRM,
      );
    });

    it("should return APDU without confirm", () => {
      command = new GetPubKeyCommand({
        ...defaultArgs,
        checkOnDevice: false,
      });
      const apdu = command.getApdu();
      expect(apdu.getRawApdu()).toEqual(
        GET_PUBKYEY_APDU_DEFAULT_PATH_WITHOUT_CONFIRM,
      );
    });

    it("should return APDU with different path", () => {
      command = new GetPubKeyCommand({
        ...defaultArgs,
        derivationPath: "44'/784'/1'/0'/0'",
      });
      const apdu = command.getApdu();
      expect(apdu.getRawApdu()).toEqual(GET_PUBKEY_APDU_DIFFERENT_PATH);
    });
  });

  describe("parseResponse", () => {
    it("should parse the response", () => {
      const parsed = command.parseResponse(GET_PUBKEY_APDU_RESPONSE);
      expect(parsed).toStrictEqual(
        CommandResultFactory({
          data: publicKeyBytes,
        }),
      );
    });

    describe("error handling", () => {
      it("should return error if response is not success", () => {
        const response = new ApduResponse({
          statusCode: Uint8Array.from([0x6a, 0x82]),
          data: new Uint8Array(0),
        });
        const result = command.parseResponse(response);
        expect(isSuccessCommandResult(result)).toBe(false);
        if (!isSuccessCommandResult(result)) {
          expect(result.error).toEqual(
            expect.objectContaining({
              _tag: "SuiAppCommandError",
              errorCode: "6a82",
              message: "Invalid off-chain message format",
            }),
          );
        } else {
          assert.fail("Expected error");
        }
      });

      it("should return error if public key is missing", () => {
        const response = new ApduResponse({
          statusCode: Uint8Array.from([0x90, 0x00]),
          data: new Uint8Array(0),
        });
        const result = command.parseResponse(response);
        expect(isSuccessCommandResult(result)).toBe(false);
        if (!isSuccessCommandResult(result)) {
          expect(result.error.originalError).toEqual(
            expect.objectContaining({
              message: "Public key is missing",
            }),
          );
        } else {
          assert.fail("Expected error");
        }
      });
    });
  });
});
