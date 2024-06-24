# Integrate Lens Frames

A client application is where frames are rendered. When a publication containing a frame URL appears in a client, interactive elements can be rendered based on the tags/values of the frame.

When a user clicks a frame button, the client makes a POST request to the frame server. The frame server then must respond with a new frame that is sent back to the client and displayed to the user.

This guide provides a detailed lifecycle of interactions between a client and frame application.

## Rendering Frames

The frame lifecycle begins when a publications containing a frame URL appears in a client feed. The first consideration for a frame application is deciding whether to render a particular.

The client should render a frame if:

- Frame contains `of:version` of `1.0.0`
- Frame contains `of:image` tag
- Frame matches current authentication status of client / user:
  - Frame can be rendered regardless of login status if tag `of:accepts:anonymous` is present
  - Frame does not contain `of:accepts:anonymous` AND `of:accepts:lens` = `1.0.0`, then frame can be rendered if user has a Lens profile connected to the client app

If a client is unable to render a frame it should fallback to displaying `og:image`.

To render a frame the client should display the following UI elements.

### Image

Clients should render the image corresponding to the `of:image` tag.

- The size of the image must be < 10 MB.
- The type of image must be jpg, png or gif.
- The image source must either be an external resource with content headers or a data URI.

Clients should respect the aspect ratio set in the `of:image:aspect_ratio` property. Clients may resize larger images or crop those that do not fit in their aspect ratio. SVG images are not because they can contain scripts and extra work must be done by clients to sanitize them. It is recommended to proxy image requests to prevent frame servers from tracking users.

### Buttons

Button actions are explained in the [main specification](./README.md#button-actions)

1. Buttons must be displayed in ascending index order below the image.
2. Buttons may be displayed in multiple rows if space is a constraint.

If the button is a `post_redirect` or `link` action:

1. It must be visually marked with a redirect symbol.
2. Users should be warned when leaving the app for untrusted sites.

If the button is a `mint` action, the following rules also apply:

1. Must validate that a [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) URL is present in the `target` property.
2. Must display the item as an NFT, if all the properties are valid.

If the button is a `tx` action, validation should be performed at the discretion of the app with recommendations described [here](#transactions--open-actions)

### Text Input

Text inputs must be displayed above the buttons and below the image. Text input labels must be shown above or inside the text input.

## Handling Clicks

If the button clicked is a `post` or `post_redirect`, apps must:

1. Construct a [Lens Frame Request](./README.md#lens-frame-request).
2. POST the packet to `of:button:$idx:target` if present
3. POST the packet to `of:post_url` if target was not present.
4. POST the packet to or the frame's embed URL if neither target nor action were present.
5. Wait at least 5 seconds for a response from the frame server.

If the button clicked is a `mint`, apps should:

1. Allow the user to mint the NFT or open an external page that allows this functionality.
2. Must display the item as an NFT, if all the properties are valid.

If the button is a tx action:

Must visually indicate that a tx button will request a wallet transaction.
Must display the button label provided by the frame.

## Handling Responses

Applications will receive responses from frame servers after a POST request is submitted. The following rules apply to the handling of these responses:

1. If the button action was `post`, treat all non-200 responses as errors.
2. If the button action was `post_redirect`, treat all non-30X responses as errors.
3. If handling a 30X response, apps must redirect the user to the url location value.
4. If handling a 30X response, apps must ensure the url starts with `http://` or `https://`.
5. If handling a 30X response, warn the user before directing them to an untrusted site.

## Signing Frame Requests

A frame can authenticate the Lens profile id that originated a request, the address that signed the request (profile owner or delegated executor), and that the content of the request matches what the profile signed. It can do so utilizing the `trustedData` fields as described in [authentication](./README.md#authentication).

A complete example of a Frame signing implemented using the Lens Client SDK is available [here](https://github.com/framesjs/frames.js/blob/main/packages/debugger/app/hooks/use-lens-identity.tsx).

The following sections detail how frame servers can utilize various methods to authenticate a Frame request:

<details>
<summary>Lens Client SDK</summary>

The process for signing frame requests depends on whether the profile has Lens API signless interactions enabled. To check if signless is enabled:

<details>
<summary>Signless Enabled</summary>

NodeJs script using Lens Client SDK to query whether profile has Lens API signless interactions enabled.

```
const { LensClient, production } = require("@lens-protocol/client");

const lensClientConfig = {
  environment: production,
};

const lensClient = new LensClient(lensClientConfig);

lensClient.profile
  .fetch({ forProfileId: "0x2a6b" }) // insert profileId here
  .then((response) => console.log(response.signless));
```

</details>

If signless is enabled, then the Lens API can sign frame requests on behalf of a user. The SDK method documented below can be used to generated a frame request signature.

<details>
<summary>Sign Frame Request</summary>

NodeJs script using Lens Client SDK to generate frame request signature. Note: requires profile to be logged into API session, [login details](https://docs.lens.xyz/docs/login).

```
const { LensClient, production } = require("@lens-protocol/client");

const lensClientConfig = {
  environment: production,
};

const lensClient = new LensClient(lensClientConfig);

// parameters populated based on frame request
lensClient.frames
  .signFrameAction({
    actionResponse:
      "0x4a2765ce77932feacfb2b06ee63161afe34781d6e00a6997af87cbe21d6b5b91",
    buttonIndex: 1,
    inputText: "Some input text",
    profileId: "0x2a6b",
    pubId: "0x2a6b-0x27-DA-0587635a",
    specVersion: "1.0.0",
    state: "Some state",
    url: "https://example.com",
  })
  .then((response) => console.log(JSON.stringify(response, null, 2)));
```

</details>

If signless is not enabled for a profile then a frame request must be manually signed by the profile owner or a delegated manager. An application can either choose to disable frame interactions if this is the case, or generate and request that a user sign each frame using `signTypedData` wallet method. The following method can be used to generate typed to sign based on the frame request.

<details>
<summary>Create Typed Data</summary>

NodeJs script using Lens Client SDK to generate typed data to sign for frame request.

```
const { LensClient, production } = require("@lens-protocol/client");

const lensClientConfig = {
  environment: production,
};

const lensClient = new LensClient(lensClientConfig);

// parameters populated based on frame request
lensClient.frames
  .createFrameTypedData({
    actionResponse:
      "0x4a2765ce77932feacfb2b06ee63161afe34781d6e00a6997af87cbe21d6b5b91",
    buttonIndex: 1,
    deadline: Math.floor(Date.now() / 1000) + 3600,
    inputText: "Some input text",
    profileId: "0x2a6b",
    pubId: "0x2a6b-0x27-DA-0587635a",
    specVersion: "1.0.0",
    state: "Some state",
    url: "https://example.com",
  })
  .then((response) => console.log(JSON.stringify(response, null, 2)));

```

</details>

</details>

<details>
<summary>Lens API</summary>

Production endpoint: https://api-v2.lens.dev

The process for signing frame requests depends on whether the profile has Lens API signless interactions enabled. To check if signless is enabled:

<details>
<summary>Signless Enabled</summary>

NodeJs script using Lens API to query whether profile has Lens API signless interactions enabled.

```
const createTypedDataQuery = `
  query Profile($request: ProfileRequest!) {
    result: profile(request: $request) {
        signless
    }
  }
`;

const createTypedDataVariables = {
  request: {
    forProfileId: "0x2a6b", // insert profileId here
  },
};

const createTypedDataOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: createTypedDataQuery,
    variables: createTypedDataVariables,
  }),
};

fetch("https://api-v2.lens.dev", createTypedDataOptions)
  .then((response) => response.json())
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((error) => console.error("Error:", error));
```

</details>

If signless is enabled, then the Lens API can sign frame requests on behalf of a user using the endpoint documented below.

<details>
<summary>Sign Frame Request</summary>

NodeJs script using Lens API to generate signature for frame request. Note: requires profile to be logged into API session using ACCESS_TOKEN, [login details](https://docs.lens.xyz/docs/login).

```
const signQuery = `
  mutation SignFrameAction($request: FrameLensManagerEIP712Request!) {
    result: signFrameAction(request: $request) {
        signature
        signedTypedData{
            types {
                FrameData {
                  name
                  type
                }
            }
            domain {
                name
                chainId
                version
                verifyingContract
            }
            value {
                specVersion
                url
                buttonIndex
                profileId
                pubId
                inputText
                state
                actionResponse
                deadline
            }
        }
    }
  }
`;

// populated based on frame interaction
const signVariables = {
  request: {
    actionResponse:
      "0x4a2765ce77932feacfb2b06ee63161afe34781d6e00a6997af87cbe21d6b5b91",
    buttonIndex: 1,
    inputText: "Some input text",
    profileId: "0x02c747",
    pubId: "0x2a6b-0x27-DA-0587635a",
    specVersion: "1.0.0",
    state: "Some state",
    url: "https://example.com",
  },
};

const signOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer INSERT_LENS_API_ACCESS_TOKEN",
  },
  body: JSON.stringify({
    query: signQuery,
    variables: signVariables,
  }),
};

fetch("https://api-v2.lens.dev", signOptions)
  .then((response) => response.json())
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((error) => console.error("Error:", error));
```

</details>

If signless is not enabled for a profile then a frame request must be manually signed by the profile owner or a delegated manager. An application can either choose to disable frame interactions if this is the case, or generate and request that a user sign each frame using `signTypedData` wallet method. The following API endpoint can be used to generate typed to sign based on the frame request.

<details>
<summary>Create Typed Data</summary>

NodeJs script using Lens API to generate typed data to sign for frame request.

```
const createTypedDataQuery = `
  query CreateFrameTypedData($request: FrameEIP712Request!) {
    result: createFrameTypedData(request: $request) {
        types {
            FrameData {
              name
              type
            }
        }
        domain {
            name
            chainId
            version
            verifyingContract
        }
        value {
            specVersion
            url
            buttonIndex
            profileId
            pubId
            inputText
            state
            actionResponse
            deadline
        }
    }
  }
`;

// populated based on frame request
const createTypedDataVariables = {
  request: {
    actionResponse:
      "0x4a2765ce77932feacfb2b06ee63161afe34781d6e00a6997af87cbe21d6b5b91",
    buttonIndex: 1,
    deadline: Math.floor(Date.now() / 1000) + 3600,
    inputText: "Some input text",
    profileId: "0x2a6b",
    pubId: "0x2a6b-0x27-DA-0587635a",
    specVersion: "1.0.0",
    state: "Some state",
    url: "https://example.com",
  },
};

const createTypedDataOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: createTypedDataQuery,
    variables: createTypedDataVariables,
  }),
};

fetch("https://api-v2.lens.dev", createTypedDataOptions)
  .then((response) => response.json())
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((error) => console.error("Error:", error));

```

</details>

</details>

## Transaction Frames / Open Actions

Applications should perform validation to ensure that users are not exposed to harmful actions, and display a detailed prompts (and potentially simulation) to inform users of the action being taken.

The recommended form of validation for Lens Applications is only allowing transactions that interact with Lens Protocol contracts, and if the action is a custom module such as an open action: verifying that the transaction originated from [within a Lens publication](./README.md#publications-as-frames--lens-protocol-actions), and the transaction data matches an open action address embedded in the publication.

An open action is a smart contract module embedded in a Lens publication. When a Lens application receives a transaction response, the app can check whether the destination address (and potentially parameters from initialize calldata as well) matches one of the open action modules attached to the publication. This is the recommended form of validating transactions because it is able to verify the intent of the user creating the publication, and also allows applications to maintain a list of recognized open action contract addresses that are able to be embedded.

Application can also validate using an allowlist of URLs for the transaction request, or a combination of open action and URL validation.

## Errors

Frames are expectd to return a response within 5 seconds. If a request exceeds this time limit, an error should be shown with a retry button.

A frame may respond to an action or transaction intent POST with an error response consisting of:

- 4XX status
- `content-type: application/json` header
- JSON body that contains a `message` property with a maximum of 90 characters

```
POST frame.server/action

400
content-type: application/json
{ message: "Invalid email"}
```

If this occurs, a client must display the `message` to a user when a frame responds with an error response and allow the user to resubmit the same frame.
