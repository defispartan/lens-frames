# Lens Protocol Frames

- [Overview](#overview)
- [Developer Quickstart](#developer-quickstart)
- [Lens Frame Specification](#lens-frame-specification)
- [Integrate Lens Frames](#integrate-lens-frames)
- [Lens Publications as Frames / Open Actions](#lens-publications-as-frames--open-actions)
- [Changelog](#changelog)
- [Future Developments](#future-developments)

# Overview

Frames are an extension of the [OpenGraph protocol](https://ogp.me/) that enable interactive elements to be embedded between web applications.

A frame is a session between a frontend and frame server. The frame server exposes visual elements and actions that are able to be interacted through a frontend that embeds the frame. Frames can represent a wide variety of applications including informational guides, games, Web3 transactions, image galleries, e-commerce, live data, and much more.

<p align="center">
  <img src="FrameSession.png" width="50%" />
</p>

A frame session is also able to incorporate authentication protocols, allowing the frame server to verify the inputs and identity of a user. The [Open Frames standard](https://github.com/open-frames/standard/tree/main) is a set of standard frame tags that enables multiple authentication protocols to be supported within a single frame server.

The Lens Frames specification is an implementation of the Open Frames standard that defines a set of tags and procedures to perform authenticated actions from a Lens Profile. The intention of Lens Frames is to create a unified set of features that frame and frontend developers can use to

The key features of Lens Frames are:

- Frame requests, responses, and authentication based on Lens Protocol primitives
- Lens API and Lens SDK methods for seamless integrations
- Publication metadata field to enable Lens Publications as frames
  - Automatically show Lens publication as frame when it appears in feed
  - Frames as a method to expose open actions contained in publication
- Open actions as a method to verify transaction frames
  - Smart contract intent of poster encoded into publication
  - Applications can allowlist open action frames based on addresses

# Developer Quickstart

<details>
<summary>Lens API</summary>

// TODO

## Setup

## Signing

## Verifying

</details>

<details>
<summary>Lens Client JavaScript / TypeScript SDK</summary>

// TODO

## Setup

@lens-protocol/client@2.0.0-alpha.37

- **feat:** added Frames module - `client.frames.createFrameTypedData` - create Frame action typed data to be signed by user wallet - `client.frames.signFrameAction` - sign Frame action with Lens Manager if enabled - `client.frames.verifyFrameSignature` - verify Frame signature
- **feat:** added support for Identity Token - `client.authentication.getIdentityToken` - retrieve Identity Token from authenticated LensClient - `client.authentication.verify({ identityToken })` - verify the token, notice new argument format

## Signing

```
  const response = await lensClient.frames.signFrameAction({
    actionResponse,
    buttonIndex,
    inputText,
    profileId,
    pubId,
    specVersion, // string, must be 1.0.0
    state,
    url,
  })
```

## Verifying

```
  const response = await lensClient.frames.verifyFrameSignature({
    identityToken,
    signature,
    signedTypedData,
  });
```

</details>

<details>
<summary>Lens React Hooks SDK</summary>

Coming soon

## Setup

@lens-protocol/react-native@2.0.0-alpha.37
@lens-protocol/react-web@2.0.0-alpha.37

`useSignFrameAction`
`useIdentityToken`

## Signing

## Verifying

</details>

# Specification

A frame is a set of <meta> tags returned within the <head> of an HTML page.

If a page contains all required frame properties, apps will render the page as a frame. The frame <meta> tags extend the OpenGraph protocol.

A frame app begins with an initial frame which is cached by apps and shown to users. A frame must have an image. It may have buttons, which when clicked load other frames or redirect the user to external websites.

## Properties

A frame property is a meta tag with a property and a content value.

### Required Properties

In compliance with the Open Frames standard, use a meta tag in your frame's HTML to declare the client protocols your frame supports.

<meta property="of:accepts:lens" content="2024-03-01" />

| Property          | Description                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `of:version`      | The version label of the Open Frames spec. Currently the only supported version is `1.0.0`                                       |
| `of:accepts:lens` | The minimum client protocol version accepted for the given protocol identifier. Currently the only supported version is `1.0.0`. |
| `of:image`        | An image which should have an aspect ratio of `1.91:1` or `1:1`.                                                                 |
| `og:image`        | An image which should have an aspect ratio of `1.91:1`. Fallback for clients that do not support frames.                         |

### Optional properties

| Property                  | Description                                                                                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `of:button:$idx`          | 256 byte string containing the user-visible label for button at index `$idx`. Buttons are 1-indexed. Maximum 4 buttons per Frame. `$idx` values must be rendered in an unbroken sequence.                                                                                              |
| `of:button:$idx:action`   | Valid options are `post`, `post_redirect`, `mint`, `link`, and `tx`. Default: `post`                                                                                                                                                                                                   |
| `of:button:$idx:target`   | The target of the action. For `post` , `post_redirect`, and link action types the target is expected to be a URL starting with `http://` or `https://`. For the mint action type the target must be a [CAIP-10 URL](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) |
| `of:button:$idx:post_url` | 256-byte string that defines a button-specific URL to send the POST payload to. If set, this overrides `of:post_url`                                                                                                                                                                   |
| `of:post_url`             | The URL where the POST payload will be sent. Must be valid and start with `http://` or `https://` . Maximum 256 bytes.                                                                                                                                                                 |
| `of:input:text`           | If this property is present, a text field should be added to the Frame. The contents of this field will be shown to the user as a label on the text field. Maximum 32 bytes.                                                                                                           |
| `of:image:aspect_ratio`   | The aspect ratio of the image specified in the `of:image` field. Allowed values are `1.91:1` and `1:1`. Default: `1.91:1`                                                                                                                                                              |
| `of:image:alt`            | Alt text associated with the image for accessibility                                                                                                                                                                                                                                   |
| `of:state`                | A state serialized to a string (for example via JSON.stringify()). Maximum 4096 bytes. Will be ignored if included on the initial frame                                                                                                                                                |

## Button actions

### `post`

The `post` action sends a HTTP POST request to the frame or button `post_url`. This is the default button type.

The frame server receives a signed frame action payload in the POST body, which includes information about which button was clicked, text input, and the cast context. The frame server must respond with a `200 OK` and another frame.

## `post_redirect`

The `post_redirect` action sends an HTTP POST request to the frame or button `post_url`. You can use this action to redirect to a URL based on frame state or user input.

The frame server receives a signed frame action payload in the POST body. The frame server must respond with a `302 Found` and `Location` header that starts with `http://` or `https://`.

## `link`

The `link` action redirects the user to an external URL. You can use this action to redirect to a URL without sending a POST request to the frame server.

Clients do not make a request to the frame server for link actions. Instead, they redirect the user to the `target` URL.

## `mint`

The `mint` action allows the user to mint an NFT. Clients that support relaying or initiating onchain transactions may enhance the mint button by relaying a transaction or interacting with the user's wallet. Clients that do not fall back to linking to an external URL.

The target property must be a valid [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) address, plus an optional token ID appended with a `:`.

## `tx`

The `tx` action allows a frame to send a transaction request to the user's connected wallet. Unlike other action types, tx actions have multiple steps.

First, the client makes a POST request to the `target` URL to fetch data about the transaction. The frame server receives a signed frame action payload in the POST body, including the address of the connected wallet in the `address` field. The frame server must respond with a `200 OK` and a JSON response describing the transaction which satisfies the following type:

```ts
type TransactionTargetResponse {
  chainId: string;
  method: "eth_sendTransaction";
  params: EthSendTransactionParams;
}
```

### Ethereum Params

If the method is `eth_sendTransaction` and the chain is an Ethereum EVM chain, the param must be of type `EthSendTransactionParams`:

- `abi`: JSON ABI which **MUST** include encoded function type and **SHOULD** include potential error types. Can be empty.
- `to`: transaction recipient
- `value`: value to send with the transaction in wei (optional)
- `data`: transaction calldata (optional)

```ts
type EthSendTransactionParams {
  abi: Abi | [];
  to: `0x${string}`;
  value?: string;
  data?: `0x${string}`;
}
```

Example:

```json
{
  "chainId": "eip155:1",                                // The chain ID of the transaction
  "method": "eth_sendTransaction",                      // The method to call on the wallet
  "params": {
    "abi": [...],                                       // JSON ABI of the function selector and any errors
    "to": "0x0000000000000000000000000000000000000001", // The recipient of the transaction
    "data": "0x00",                                     // Transaction calldata
    "value": "123456789",                               // Value to send with the transaction
  },
};
```

The client then sends a transaction request to the user's connected wallet. The wallet should prompt the user to sign the transaction and broadcast it to the network. The client should then send a POST request to the `post_url` with a signed frame action payload including the transaction hash in the `transactionId` field to which the frame server should respond with a `200 OK` and another frame.

### Images

There are a few rules for serving images in `of:frame:image` tags:

- The size of the image must be < 10 MB.
- The type of image must be jpg, png or gif.
- The image source must either be an external resource with content headers or a data URI.

Clients may resize larger images or crop those that do not fit in their aspect ratio. SVG images are not because they can contain scripts and extra work must be done by clients to sanitize them.

When a frame server receives a POST request:

- It must respond within 5 seconds.
- It must respond with a 200 OK and another frame, on a post button click.
- It must respond with a 302 OK and a Location header, on a post_redirect button click.
- Any Location header provided must contain a URL that starts with http:// or https://.

Best Practices:

- Add timestamps or UUIDs to image urls on subsequent frames to bust caches.
- Return a frame with a "refresh" button if your response takes > 5 seconds.
- Sanitize all input received from the user via text inputs.
- If needed, validate request data according to [Lens Frame Authentication](#lens-frame-authentication)

### Frame Requests

When a user clicks a button on a frame, the frame receives a POST request with a payload containing both `untrustedData` and `trustedData`. The `untrustedData` contains the raw request payload. The `trustedData` contains authentication details that a frame can use to verify the action and/or identity performing the frame action.

The schema for Lens frame requests is as follows:

```
{
  clientProtocol: "lens",               // string, authentication protocol that frame server will verify
  untrustedData: {
    profileId: "0x123",                 // string, Lens profile ID performing the action
    pubId: "0x123-0x1",                 // string, Lens publication ID, profile ID + profile publication index
    url: "https://example.com",         // string, the URL of the Frame that was clicked. May be different from the URL that the data was posted to.
    unixTimestamp: 123456789,           // number, Unix timestamp in milliseconds
    buttonIndex: 1,                     // number, the button that was clicked
    inputText?: "Hello, World!",        // string, input text for the Frame's text input, if present. Undefined if no text input field is present
    state?: "%7B%22counter%22%3A1%7D"   // string, state that was passed from the frame, passed back to the frame, serialized to a string. Max 4kB.q
  },
  trustedData: {
    messageBytes: "",                   // string, EIP-712 signed message of request payload or blank string if no action authentication
    identityToken?: "",                 // string, identity token issued by Lens API to verify user identity and/or perform verification with Lens API from frame server
    signerType?: "",                    // string, specifies type of signer used to sign typed data from messageBytes: "owner" or "delegatedExecutor"
    signer?: "",                        // string, address used to sign type data from messageBytes
  }
}
```

### Authentication

TODO - Describe role of typed data vs identity token and how they relate to Lens profiles and delegated executors
TODO - Detailed explanation of frame request scheme, how to generate and verify
TODO - Document Lens API, Client SDK, and React SDK methods to generate, sign, and verify typed data

Authentication of Lens frame requests is performed by the frame server.

messageBytes: "", // string, EIP-712 signed message of request payload or blank string if no action authentication
identityToken?: "", // string, identity token issued by Lens API to verify user identity and/or perform verification with Lens API from frame server
signerType?: "", // string, specifies type of signer used to sign typed data from messageBytes: "owner" or "delegatedExecutor"
signer?: "", // string, address used to sign type data from messageBytes

The signed message corresponds to EIP-712 typed data that can be validated using the following signature scheme:

<details>
<summary>Frame Request EIP-712 Typed Data</summary>

```
// EIP-712 domain
const domain = {
    name: 'Lens Frames',
    version: '1.0.0',
}

// EIP-712 types
const types = {
    FrameData: [
        { name: 'specVersion', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'buttonIndex', type: 'uint256' },
        { name: 'profileId', type: 'string' },
        { name: 'pubId', type: 'string' },
        { name: 'inputText', type: 'string' },
        { name: 'state', type: 'string' },
    ],
};

// Data to sign, from frameDispatcherSignature endpoint request
const sampleData = {
    specVersion: '1.0.0',
    url: 'https://mylensframe.xyz',
    buttonIndex: 2,
    profileId: '0x2a6b',
    pubId: '0x2a6b-0x11-DA-bf2507ac',
    inputText: 'Hello, World!',
    state: '{"counter":1,"idempotency_key":"431b8b38-eb4d-455b"}',
};
```

<details>

### Lens API Identity Token

TODO - Description + Lens API, Client SDK, and React SDK implementations

# Integrate Lens Frames

A Client Application is where Frames are rendered. A publication containing Frame tags has elements rendered based on the Frame specification and individual tags/values of the Frame instance.

When a user clicks a button on a frame, the app makes a POST request to the frame server. The server must respond with a new frame that is sent back to the user.

The Frame lifecycle begins when a user creates a publications containing a frame URL. The client application should:

- Check all embedded publication URLs for valid frames (based on meta tag versions).
- If the frame is valid, render the frame when the cast is viewed.
- If the frame is malformed, fall back to treating it as an OpenGraph embed.
- Follow the frame security model.
- Proxy image requests to prevent frame servers from tracking users.
- Sanitize redirect URLs to ensure they start with http:// or https://.
- Only accept data URIs if they are images.
- Avoid rendering SVGs as they may contain executable code.

### Rendering Frames

Apps may render frames any time they are showing a Lens Publication to a viewer. The following rules apply to the rendering of frames:

1. Buttons must be displayed in ascending index order below the image.
2. Buttons may be displayed in multiple rows if space is a constraint.
3. Text inputs must be displayed above the buttons and below the image.
4. Text input labels must be shown above or inside the text input.
5. Apps must respect the aspect ratio set in the `of:frame:image:aspect_ratio` property.

If the button is a `post_redirect` or `link` action:

1. It must be visually marked with a redirect symbol.
2. Users should be warned when leaving the app for untrusted sites.

If the button is a `mint` action, the following rules also apply:

1. Must validate that a [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) URL is present in the `target` property.
2. Must display the item as an NFT, if all the properties are valid.

If the button is a `tx` action, validation should be performed at the discretion of the app with recommendations described [here](#transaction--open-action)

### Handling Clicks

If the button clicked is a `post` or `post_redirect`, apps must:

1. Construct a [Lens Frame Request](#lens-frame-request).
2. POST the packet to `of:frame:button:$idx:target` if present
3. POST the packet to `of:frame:post_url` if target was not present.
4. POST the packet to or the frame's embed URL if neither target nor action were present.
5. Wait at least 5 seconds for a response from the frame server.

If the button clicked is a `mint`, apps should:

1. Allow the user to mint the NFT or open an external page that allows this functionality.
2. Must display the item as an NFT, if all the properties are valid.

If the button is a tx action:

Must visually indicate that a tx button will request a wallet transaction.
Must display the button label provided by the frame.

### Handling Responses

Applications will receive responses from frame servers after a POST request is submitted. The following rules apply to the handling of these responses:

1. If the button action was `post`, treat all non-200 responses as errors.
2. If the button action was `post_redirect`, treat all non-30X responses as errors.
3. If handling a 30X response, apps must redirect the user to the url location value.
4. If handling a 30X response, apps must ensure the url starts with `http://` or `https://`.
5. If handling a 30X response, warn the user before directing them to an untrusted site.

### Transaction / Open Action

Applications should perform validation to ensure that users are not exposed to harmful actions.

The recommended form of validation for Lens Applications is only allowing transactions that match an embedded open action. An open action is a smart contract module embedded in a Lens publication. When a Lens application receives a transaction response, the app can check whether the destination address matches one of the open action modules attached to the publication. This is the recommended form of validating transactions because it is able to check the intent of the user creating the publication, and also allows applications to maintain a list of recognized open action contract addresses that are enabled to be embedded.

Application can also validate using an allowlist of URLs for the transaction request, or a combination of open action and URL validation.

# Lens Publications as Frames / Open Actions

The LIP (Lens Improvement Proposal) to introduce Lens Frames also proposes to add a publication metadata field: `preferredFrame`. The field enables Lens publication to appear in a feed, and automatically have the modules (reference modules and open actions) it contains rendered as Frame within Lens application feeds.

This metadata field enables application developers to build a new open action, or a frontend for an existing action, and have it automatically and directly embedded within other Lens application feeds.

As a hypothetical example, assume a developer creates a new NFT minting open action and builds a custom transaction frame for their action at https://mynftaction.xyz. If a publication contains the NFT open action and the metadata `preferredFrame: https://mynftaction.xyz`, this publication can appear in another Lens app feed and the app automatically embeds the frame url: https://mynftaction.xyz/0x2a6b-0x16. This allows the open action developer to expose their open action through other Lens apps, and Lens apps to verify the safety of the action being taken by checking the open action contract address contained in the publication.

More details on application integration of open actions [here](#transaction--open-action). Link formatting is the example above is an area for #future-developments.

# Changelog

| Version | Date       | Change                |
| ------- | ---------- | --------------------- |
| 1.0.0   | 2024-04-04 | Initial specification |

# Future Developments

- Helper methods to expand validation of open actions to verify initialize data such as type of collect module, accepted currency, etc.
- Extend SDK to abstract generating and parsing frame requests
- Add resources section for libraries and examples
- Standard link formatting for publications with `preferredFrame` metadata
