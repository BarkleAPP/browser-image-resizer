# browser-image-resizer

## Introduction

This library allows for cross-browser image downscaling and resizing utilizing `<canvas>`. Note that this is browser-only utility and will not work in Node.js.

<!--
## Demo

- [Code Sandbox - NPM](https://codesandbox.io/s/6x20vw7l4r)
- [Code Sandbox - In-Browser](https://codesandbox.io/s/nroxwpn21p)
-->

## Installation

### NPM/Yarn

- `npm install git+https://github.com/misskey-dev/browser-image-resizer`
- `yarn add git+https://github.com/misskey-dev/browser-image-resizer`

### Browser

```
<script src="https://cdn.jsdelivr.net/gh/misskey-dev/browser-image-resizer@2.2.1-misskey.2/dist/index.js"></script>
```

## Usage

### NPM/Yarn

#### Promises

```javascript
import { readAndCompressImage } from 'browser-image-resizer';

const config = {
  quality: 0.5,
  maxWidth: 800,
  maxHeight: 600,
  debug: true
};

// Note: A single file comes from event.target.files on <input>
readAndCompressImage(file, config)
  .then(resizedImage => {
    // Upload file to some Web API
    const url = `http://localhost:3001/upload`;
    const formData = new FormData();
    formData.append('images', resizedImage);
    const options = {
      method: 'POST',
      body: formData
    };

    return fetch(url, options);
  })
  .then(result => {
    // TODO: Handle the result
    console.log(result);
  });
```

#### Async/Await

```javascript
import { readAndCompressImage } from 'browser-image-resizer';

const config = {
  quality: 0.7,
  width: 800,
  height: 600
};

// Note: A single file comes from event.target.files on <input>
async function uploadImage(file) {
  try {
    let resizedImage = await readAndCompressImage(file, config);

    const url = `http://localhost:3001/upload`;
    const formData = new FormData();
    formData.append('images', resizedImage);
    const options = {
      method: 'POST',
      body: formData
    };

    let result = await fetch(url, options);

    // TODO: Handle the result
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw(error);
  }
}
```

### Browser

#### Promises

```javascript
const config = {
  quality: 0.5,
  maxWidth: 800,
  maxHeight: 600,
  debug: true
};

// Note: A single file comes from event.target.files on <input>
BrowserImageResizer.readAndCompressImage(file, config)
  .then(resizedImage => {
    // Upload file to some Web API
    const url = `http://localhost:3001/upload`;
    const formData = new FormData();
    formData.append('images', resizedImage);
    const options = {
      method: 'POST',
      body: formData
    };

    return fetch(url, options);
  })
  .then(result => {
    // TODO: Handle the result
    console.log(result);
  });
```

#### Async/Await

```javascript

const config = {
  quality: 0.7,
  width: 800,
  height: 600
};

// Note: A single file comes from event.target.files on <input>
async function uploadImage(file) {
  try {
    let resizedImage = await BrowserImageResizer.readAndCompressImage(file, config);

    const url = `http://localhost:3001/upload`;
    const formData = new FormData();
    formData.append('images', resizedImage);
    const options = {
      method: 'POST',
      body: formData
    };

    let result = await fetch(url, options);

    // TODO: Handle the result
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw(error);
  }
}
```


### readAndCompressImage(file, config) => Promise<Blob>

#### Inputs

* `file`: A File object, usually from an `<input>`
* `config`: See below

| Property Name        | Purpose           | Default Value  |
| ------------- |-------------| -----:|
| `quality`      | The quality of the image | 0.5 |
| `maxWidth`      | The maximum width for the downscaled image | 800 |
| `maxHeight` | The maximum height for the downscaled image | 600 |
| `debug` | console.log image update operations | false |
| `mimeType` | specify image output type other than jpeg  | 'image/jpeg' |

### Outputs

A Promise that yields an Image Blob

### Output Image Specification
The output image is derived from `canvas.toDataURL`.

- EXIF and other metadata will be erased.
- Rotation will be automatically corrected.
  * It is based on the specifications of recent versions of modern browsers and may not work with older browsers.
  * See https://github.com/w3c/csswg-drafts/issues/4666#issuecomment-610962845
  * Firefox support seems to be available from version 78. [by mei23](https://github.com/misskey-dev/misskey/pull/8216#issuecomment-1041382112)
- Color profile is srgb. Firefox 97 does not attach the ICC profile, but Chrome does.
- You can specify image/webp as the mimeType, but [Safari will ignore `quality` (treated as 1)](https://developer.apple.com/documentation/webkitjs/htmlcanvaselement/1630000-todataurl).
