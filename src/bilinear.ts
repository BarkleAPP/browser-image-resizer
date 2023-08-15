export function bilinear(srcCanvasData: ImageData, destCanvasData: ImageData, scale: number) {
	function inner(f00: number, f10: number, f01: number, f11: number, x: number, y: number) {
		let un_x = 1.0 - x;
		let un_y = 1.0 - y;
		return f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y;
	}
	let i: number, j: number;
	let iyv: number, iy0: number, iy1: number, ixv: number, ix0: number, ix1: number;
	let idxD: number, idxS00: number, idxS10: number, idxS01: number, idxS11: number;
	let dx: number, dy: number;
	let r: number, g: number, b: number, a: number;
	for (i = 0; i < destCanvasData.height; ++i) {
		iyv = i / scale;
		iy0 = Math.floor(iyv);
		// Math.ceil can go over bounds
		iy1 =
			Math.ceil(iyv) > srcCanvasData.height - 1
				? srcCanvasData.height - 1
				: Math.ceil(iyv);
		for (j = 0; j < destCanvasData.width; ++j) {
			ixv = j / scale;
			ix0 = Math.floor(ixv);
			// Math.ceil can go over bounds
			ix1 =
				Math.ceil(ixv) > srcCanvasData.width - 1
					? srcCanvasData.width - 1
					: Math.ceil(ixv);
			idxD = (j + destCanvasData.width * i) * 4;
			// matrix to vector indices
			idxS00 = (ix0 + srcCanvasData.width * iy0) * 4;
			idxS10 = (ix1 + srcCanvasData.width * iy0) * 4;
			idxS01 = (ix0 + srcCanvasData.width * iy1) * 4;
			idxS11 = (ix1 + srcCanvasData.width * iy1) * 4;
			// overall coordinates to unit square
			dx = ixv - ix0;
			dy = iyv - iy0;
			// I let the r, g, b, a on purpose for debugging
			r = inner(
				srcCanvasData.data[idxS00],
				srcCanvasData.data[idxS10],
				srcCanvasData.data[idxS01],
				srcCanvasData.data[idxS11],
				dx,
				dy
			);
			destCanvasData.data[idxD] = r;

			g = inner(
				srcCanvasData.data[idxS00 + 1],
				srcCanvasData.data[idxS10 + 1],
				srcCanvasData.data[idxS01 + 1],
				srcCanvasData.data[idxS11 + 1],
				dx,
				dy
			);
			destCanvasData.data[idxD + 1] = g;

			b = inner(
				srcCanvasData.data[idxS00 + 2],
				srcCanvasData.data[idxS10 + 2],
				srcCanvasData.data[idxS01 + 2],
				srcCanvasData.data[idxS11 + 2],
				dx,
				dy
			);
			destCanvasData.data[idxD + 2] = b;

			a = inner(
				srcCanvasData.data[idxS00 + 3],
				srcCanvasData.data[idxS10 + 3],
				srcCanvasData.data[idxS01 + 3],
				srcCanvasData.data[idxS11 + 3],
				dx,
				dy
			);
			destCanvasData.data[idxD + 3] = a;
		}
	}
}
