# Ledger Sui Signer Implementation

This module provides the implementation of the Ledger Sui signer of the Device Management Kit. It enables interaction with the Sui application on a Ledger device including:

- Retrieving the Sui address using a given derivation path;
- Signing a Sui transaction;
- Signing an offchain message displayed on a Ledger device;
- Retrieving the app configuration;

## 🔹 Index

- [Ledger Sui Signer Implementation](#ledger-sui-signer-implementation)
  - [🔹 Index](#-index)
  - [🔹 How it works](#-how-it-works)
  - [🔹 Installation](#-installation)
  - [🔹 Initialisation](#-initialisation)
  - [🔹 Use Cases](#-use-cases)
    - [Use Case 1: Get Address](#use-case-1-get-address)
      - [**Parameters**](#parameters)
      - [**Returns**](#returns)
    - [Use Case 2: Sign Transaction](#use-case-2-sign-transaction)
      - [**Parameters**](#parameters-1)
      - [**Returns**](#returns-1)
    - [Use Case 3: Sign Message](#use-case-3-sign-message)
      - [**Parameters**](#parameters-2)
      - [**Returns**](#returns-2)
    - [Use Case 4: Get App Configuration](#use-case-4-get-app-configuration)
      - [**Returns**](#returns-3)
  - [🔹 Observable Behavior](#-observable-behavior)
  - [🔹 Example](#-example)

## 🔹 How it works

The Ledger Sui Signer utilizes the advanced capabilities of the Ledger device to provide secure operations for end users. It takes advantage of the interface provided by the Device Management Kit to establish communication with the Ledger device and execute various operations. The communication with the Ledger device is performed using [APDU](https://en.wikipedia.org/wiki/Smart_card_application_protocol_data_unit)s (Application Protocol Data Units), which are encapsulated within the `Command` object. These commands are then organized into tasks, allowing for the execution of complex operations with one or more APDUs. The tasks are further encapsulated within `DeviceAction` objects to handle different real-world scenarios. Finally, the Signer exposes dedicated and independent use cases that can be directly utilized by end users.

## 🔹 Installation

> **Note:** This module is not standalone; it depends on the [@ledgerhq/device-management-kit](https://github.com/LedgerHQ/device-sdk-ts/tree/develop/packages/device-management-kit) package, so you need to install it first.

To install the `device-signer-kit-sui` package, run the following command:

```sh
npm install @ledgerhq/device-signer-kit-sui
```

## 🔹 Initialisation

To initialise a Sui signer instance, you need a Ledger Device Management Kit instance and the ID of the session of the connected device. Use the `SignerSuiBuilder` along with the [Context Module](https://github.com/LedgerHQ/device-sdk-ts/tree/develop/packages/signer/context-module) by default developed by Ledger:

```typescript
const signerSui = new SignerSuiBuilder({ sdk, sessionId }).build();
```

## 🔹 Use Cases

The `SignerSuiBuilder.build()` method will return a `SignerSui` instance that exposes 4 dedicated methods, each of which calls an independent use case. Each use case will return an object that contains an observable and a method called `cancel`.

---

### Use Case 1: Get Address

This method allows users to retrieve the Sui address based on a given `derivationPath`.

```typescript
const { observable, cancel } = signerSui.getAddress(derivationPath, options);
```

#### **Parameters**

- `derivationPath`

  - **Required**
  - **Type:** `string` (e.g., `"44'/501'/0'"`)
  - The derivation path used for the Sui address. See [here](https://www.ledger.com/blog/understanding-crypto-addresses-and-derivation-paths) for more information.

- `options`

  - Optional
  - Type: `AddressOptions`

    ```typescript
    type AddressOptions = {
      checkOnDevice?: boolean;
    };
    ```

  - `checkOnDevice`: An optional boolean indicating whether user confirmation on the device is required (`true`) or not (`false`).

#### **Returns**

- `observable` Emits DeviceActionState updates, including the following details:

```typescript
type GetAddressCommandResponse = {
  publicKey: string; // Address in base58 format
};
```

- `cancel` A function to cancel the action on the Ledger device.

---

### Use Case 2: Sign Transaction

This method enables users to securely sign transactions using clear signing on Ledger devices.

```typescript
const { observable, cancel } = signerSui.signTransaction(
  derivationPath,
  transaction,
  options,
);
```

#### **Parameters**

- `derivationPath`

  - **Required**
  - **Type:** `string` (e.g., `"44'/501'/0'"`)
  - The derivation path used in the transaction. See [here](https://www.ledger.com/blog/understanding-crypto-addresses-and-derivation-paths) for more information.

- `transaction`

  - **Required**
  - **Type:** `Uint8Array`
  - The transaction object that needs to be signed.

- `options`

  - **Optional**
  - **Type:** `TBD`
  - No option defined yet, but will be used for clear signing in a near future.

    ```typescript
    type TransactionOptions = {};
    ```

#### **Returns**

- `observable` Emits DeviceActionState updates, including the following details:

```typescript
type Signature = Uint8Array; // Signed transaction bytes
```

- `cancel` A function to cancel the action on the Ledger device.

---

### Use Case 3: Sign Message

This method allows users to sign a text string that is displayed on Ledger devices.

```typescript
const { observable, cancel } = signerSui.signMessage(
  derivationPath,
  message,
);
```

#### **Parameters**

- `derivationPath`

  - **Required**
  - **Type:** `string` (e.g., `"44'/501'/0'"`)
  - The derivation path used by the Sui message. See [here](https://www.ledger.com/blog/understanding-crypto-addresses-and-derivation-paths) for more information.

- `message`

  - **Required**
  - **Type:** `string`
  - The message to be signed, which will be displayed on the Ledger device.

#### **Returns**

- `observable` Emits DeviceActionState updates, including the following details:

```typescript
type Signature = Uint8Array; // Signed message bytes
```

- `cancel` A function to cancel the action on the Ledger device.

---

### Use Case 4: Get App Configuration

This method allows the user to fetch the current app configuration.

```typescript
const { observable, cancel } = signerSui.getAppConfiguration();
```

#### **Returns**

- `observable` Emits DeviceActionState updates, including the following details:

```typescript
type AppConfiguration = {
  blindSigningEnabled: boolean;
  pubKeyDisplayMode: PublicKeyDisplayMode;
  version: string;
};
```

- `cancel` A function to cancel the action on the Ledger device.

## 🔹 Observable Behavior

Each method returns an [Observable](https://rxjs.dev/guide/observable) emitting updates structured as [`DeviceActionState`](https://github.com/LedgerHQ/device-sdk-ts/blob/develop/packages/device-management-kit/src/api/device-action/model/DeviceActionState.ts). These updates reflect the operation’s progress and status:

- **NotStarted**: The operation hasn’t started.
- **Pending**: The operation is in progress and may require user interaction.
- **Stopped**: The operation was canceled or stopped.
- **Completed**: The operation completed successfully, with results available.
- **Error**: An error occurred.

**Example Observable Subscription:**

```typescript
observable.subscribe({
  next: (state: DeviceActionState) => {
    switch (state.status) {
      case DeviceActionStatus.NotStarted: {
        console.log("The action is not started yet.");
        break;
      }
      case DeviceActionStatus.Pending: {
        const {
          intermediateValue: { requiredUserInteraction },
        } = state;
        // Access the intermediate value here, explained below
        console.log(
          "The action is pending and the intermediate value is: ",
          intermediateValue,
        );
        break;
      }
      case DeviceActionStatus.Stopped: {
        console.log("The action has been stopped.");
        break;
      }
      case DeviceActionStatus.Completed: {
        const { output } = state;
        // Access the output of the completed action here
        console.log("The action has been completed: ", output);
        break;
      }
      case DeviceActionStatus.Error: {
        const { error } = state;
        // Access the error here if occurred
        console.log("An error occurred during the action: ", error);
        break;
      }
    }
  },
});
```

**Intermediate Values in Pending Status:**

When the status is DeviceActionStatus.Pending, the state will include an `intermediateValue` object that provides useful information for interaction:

```typescript
const { requiredUserInteraction } = intermediateValue;

switch (requiredUserInteraction) {
  case UserInteractionRequired.VerifyAddress: {
    // User needs to verify the address displayed on the device
    console.log("User needs to verify the address displayed on the device.");
    break;
  }
  case UserInteractionRequired.SignTransaction: {
    // User needs to sign the transaction displayed on the device
    console.log("User needs to sign the transaction displayed on the device.");
    break;
  }
  case UserInteractionRequired.SignTypedData: {
    // User needs to sign the typed data displayed on the device
    console.log("User needs to sign the typed data displayed on the device.");
    break;
  }
  case UserInteractionRequired.SignPersonalMessage: {
    // User needs to sign the message displayed on the device
    console.log("User needs to sign the message displayed on the device.");
    break;
  }
  case UserInteractionRequired.None: {
    // No user action required
    console.log("No user action needed.");
    break;
  }
  case UserInteractionRequired.UnlockDevice: {
    // User needs to unlock the device
    console.log("The user needs to unlock the device.");
    break;
  }
  case UserInteractionRequired.ConfirmOpenApp: {
    // User needs to confirm on the device to open the app
    console.log("The user needs to confirm on the device to open the app.");
    break;
  }
  default:
    // Type guard to ensure all cases are handled
    const uncaughtUserInteraction: never = requiredUserInteraction;
    console.error("Unhandled user interaction case:", uncaughtUserInteraction);
}
```

## 🔹 Example

We encourage you to explore the Sui Signer by trying it out in our online [sample application](https://app.devicesdk.ledger-test.com/). Experience how it works and see its capabilities in action. Of course, you will need a Ledger device connected.
