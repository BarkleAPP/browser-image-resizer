import { BrowserImageResizerConfig } from '.';
import { bilinear } from './bilinear';
import { Hermit } from './hermite';

let hermite: Hermit;

function findMaxWidth(config: BrowserImageResizerConfig, canvas: HTMLCanvasElement | OffscreenCanvas) {
	//Let's find the max available width for scaled image
	const ratio = canvas.width / canvas.height;
	let mWidth = Math.min(
		canvas.width,
		config.maxWidth,
		ratio * config.maxHeight
	);
	if (
		config.maxSize &&
		config.maxSize > 0 &&
		config.maxSize < (canvas.width * canvas.height) / 1000
	)
		mWidth = Math.min(
			mWidth,
			Math.floor((config.maxSize * 1000) / canvas.height)
		);
	if (!!config.scaleRatio)
		mWidth = Math.min(mWidth, Math.floor(config.scaleRatio * canvas.width));

	if (config.debug) {
		console.log(
			'browser-image-resizer: original image size = ' +
			canvas.width +
			' px (width) X ' +
			canvas.height +
			' px (height)'
		);
		console.log(
			'browser-image-resizer: scaled image size = ' +
			mWidth +
			' px (width) X ' +
			Math.floor(mWidth / ratio) +
			' px (height)'
		);
	}
	if (mWidth <= 0) {
		mWidth = 1;
		console.warn("browser-image-resizer: image size is too small");
	}

	return mWidth;
}

export function getImageData(canvas: OffscreenCanvas, scaled: OffscreenCanvas) {
	const srcImgData = canvas
		?.getContext('2d')
		?.getImageData(0, 0, canvas.width, canvas.height);
	const destImgData = scaled
		?.getContext('2d')
		?.createImageData(scaled.width, scaled.height);

	if (!srcImgData || !destImgData) throw Error('Canvas is empty (scaleCanvasWithAlgorithm). You should run this script after the document is ready.');

	return { srcImgData, destImgData };
}

function prepareHermit() {
	if (!hermite) hermite = new Hermit();
}

async function scaleCanvasWithAlgorithm(canvas: OffscreenCanvas, config: BrowserImageResizerConfig & { outputWidth: number }) {
	const scale = config.outputWidth / canvas.width;

	const scaled = new OffscreenCanvas(config.outputWidth, Math.min(Math.floor(canvas.height * scale), config.maxHeight));

	switch (config.argorithm) {
		case 'hermite': {
			prepareHermit();
			await hermite.resampleAuto(canvas, scaled, config);
			break;
		} case 'hermite_single': {
			const { srcImgData, destImgData } = getImageData(canvas, scaled);
			prepareHermit();
			hermite.resampleSingle(srcImgData, destImgData, config);
			scaled?.getContext('2d')?.putImageData(destImgData, 0, 0);
			break;
		} case 'bilinear': {
			const { srcImgData, destImgData } = getImageData(canvas, scaled);
			bilinear(srcImgData, destImgData, scale);
			scaled?.getContext('2d')?.putImageData(destImgData, 0, 0);
			break;
		} default: {
			throw Error('Unknown algorithm');
		}
	}

	return scaled;
}

function getHalfScaleCanvas(src: OffscreenCanvas | HTMLCanvasElement) {
	const half = new OffscreenCanvas(src.width / 2, src.height / 2);

	half
		?.getContext('2d')
		?.drawImage(src, 0, 0, half.width, half.height);

	return half;
}

export async function scaleImage({ img, config }: {
	img: ImageBitmapSource | OffscreenCanvas;
	config: BrowserImageResizerConfig;
}) {
	if (config.debug) {
		console.log('Scale: Started', img);
	}
	let converting: OffscreenCanvas;

	if (img instanceof OffscreenCanvas) {
		converting = img;
	} else {
		const bmp = await createImageBitmap(img);
		converting = new OffscreenCanvas(bmp.width, bmp.height);
		converting.getContext('2d')?.drawImage(bmp, 0, 0);
	}

	if (!converting?.getContext('2d')) throw Error('Canvas Context is empty.');

	const maxWidth = findMaxWidth(config, converting);
	if (config.debug) console.log(`Scale: Max width is ${maxWidth}`);
	while (converting.width >= 2 * maxWidth) {
		if (config.debug) console.log(`Scale: Scaling canvas by half from ${converting.width}`);
		converting = getHalfScaleCanvas(converting);
	}

	if (converting.width > maxWidth) {
		if (config.debug) console.log(`Scale: Scaling canvas by ${config.argorithm} from ${converting.width} to ${maxWidth}`);
		converting = await scaleCanvasWithAlgorithm(
			converting,
			Object.assign(config, { outputWidth: maxWidth }),
		);
	}

	if (config.mimeType === null) {
		return converting;
	}
	const imageData = await converting.convertToBlob({ type: config.mimeType, quality: config.quality });
	return imageData;
}
