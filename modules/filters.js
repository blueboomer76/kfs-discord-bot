function getPixelFactor(img) {
	return Math.ceil((img.bitmap.width > img.bitmap.height ? img.bitmap.width : img.bitmap.height) / 100);
}

module.exports.applyJimpFilter = (img, filter, options) => {
	switch (filter) {
		case "blur":
			img.blur(options.blur || getPixelFactor(img));
			break;
		case "colorify": {
			const r = options.colors[0],
				g = options.colors[1],
				b = options.colors[2],
				cr = (255 - r) / 1.5,
				cg = (255 - g) / 1.5,
				cb = (255 - b) / 1.5;
			const intensityFactor = 1 - (options.intensity - 1) / 9,
				lowerBound = intensityFactor * -0.5,
				upperBound = intensityFactor * 1.5,
				rangeFactor = (upperBound - lowerBound) / 765;

			// The constant c is always -0.5 to 1.5
			img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, i) => {
				const c = lowerBound + (img.bitmap.data[i] + img.bitmap.data[i+1] + img.bitmap.data[i+2]) * rangeFactor;
				if (c < 0) {
					const c1 = -c + 0.5;
					img.bitmap.data[i] = c1 * r;
					img.bitmap.data[i+1] = c1 * g;
					img.bitmap.data[i+2] = c1 * b;
				} else {
					img.bitmap.data[i] = c * cr + r;
					img.bitmap.data[i+1] = c * cg + g;
					img.bitmap.data[i+2] = c * cb + b;
				}
			});
			break;
		}
		case "deepfry":
			img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, i) => {
				img.bitmap.data[i] = img.bitmap.data[i] < 144 ? 0 : 255;
				img.bitmap.data[i+1] = img.bitmap.data[i+1] < 144 ? 0 : 255;
				img.bitmap.data[i+2] = img.bitmap.data[i+2] < 144 ? 0 : 255;
			});
			img.quality(1);
			break;
		case "flip":
			img.flip(true, false);
			break;
		case "flop":
			img.flip(false, true);
			break;
		case "greyscale":
			img.greyscale();
			break;
		case "invert":
			img.invert();
			break;
		case "needsmorejpeg":
			img.quality(1);
			break;
		case "pixelate":
			img.pixelate(options.pixels || getPixelFactor(img));
			break;
		case "rainbowify": {
			const centerX = img.bitmap.width / 2,
				centerY = img.bitmap.height / 2;
			const stretchFactor = img.bitmap.width / img.bitmap.height,
				maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));

			// The constant c is always -0.5 to 1.5
			img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, i) => {
				const angle = Math.atan2((y - centerY) * stretchFactor, x - centerX) * 180 / Math.PI,
					adjustedAngle = (angle + 450) % 360;
				const rawR = Math.max(Math.min(255 / 60 * Math.abs(adjustedAngle - 180) - 255, 255), 0),
					rawG = Math.max(Math.min(-255 / 60 * Math.abs(adjustedAngle - 120) + 510, 255), 0),
					rawB = Math.max(Math.min(-255 / 60 * Math.abs(adjustedAngle - 240) + 510, 255), 0);

				const currentDistance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)),
					distanceFactor = 1 - currentDistance / maxDistance;
				const r = (255 - rawR) * distanceFactor + rawR,
					g = (255 - rawG) * distanceFactor + rawG,
					b = (255 - rawB) * distanceFactor + rawB,
					cr = (255 - r) / 1.5,
					cg = (255 - g) / 1.5,
					cb = (255 - b) / 1.5;

				const c = (img.bitmap.data[i] + img.bitmap.data[i+1] + img.bitmap.data[i+2]) / 382.5 - 0.5;
				if (c < 0) {
					const c1 = -c + 0.5;
					img.bitmap.data[i] = c1 * r;
					img.bitmap.data[i+1] = c1 * g;
					img.bitmap.data[i+2] = c1 * b;
				} else {
					img.bitmap.data[i] = c * cr + r;
					img.bitmap.data[i+1] = c * cg + g;
					img.bitmap.data[i+2] = c * cb + b;
				}
			});
			break;
		}
		case "randomcrop": {
			const baseX1 = Math.random() * 0.25,
				baseY1 = Math.random() * 0.25,
				baseX2 = 1 - Math.random() * 0.25,
				offsetSum = baseX1 + baseY1 + (1 - baseX2),
				newY2Offset = offsetSum < 0.1 ? 0.1 - offsetSum : 0,
				baseY2 = (1 - newY2Offset) - Math.random() * (0.25 - newY2Offset);

			img.crop(baseX1 * img.bitmap.width, baseY1 * img.bitmap.height,
				baseX2 * img.bitmap.width, baseY2 * img.bitmap.height);
			break;
		}
		case "resize":
			img.scale(options.scale, options.scale);
			break;
		case "rotate":
			img.rotate(options.rotation || 90);
			break;
		case "sepia":
			img.sepia();
			break;
	}
};