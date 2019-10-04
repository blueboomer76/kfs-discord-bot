function getPixelFactor(img) {
	return Math.ceil((img.bitmap.width > img.bitmap.height ? img.bitmap.width : img.bitmap.height) / 100);
}

module.exports.applyJimpFilter = (img, filter, options) => {
	switch (filter) {
		case "blur":
			img.blur(options.blur || getPixelFactor(img));
			break;
		case "colorify":
			img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, i) => {
				const avg = (img.bitmap.data[i] + img.bitmap.data[i+1] + img.bitmap.data[i+2]) / 3;
				img.bitmap.data[i] = (avg / 255) * (255 - options.colors[0]) + options.colors[0];
				img.bitmap.data[i+1] = (avg / 255) * (255 - options.colors[1]) + options.colors[1];
				img.bitmap.data[i+2] = (avg / 255) * (255 - options.colors[2]) + options.colors[2];
			});
			break;
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
		case "randomcrop": {
			const baseX1 = Math.random() * 0.25,
				baseY1 = Math.random() * 0.25,
				baseX2 = 1 - Math.random() * 0.25,
				offsetSum = baseX1 + baseY1 + (1 - baseX2),
				newY2Offset = offsetSum < 0.1 ? 0.1 - offsetSum : 0,
				baseY2 = (1 - newY2Offset) - Math.random() * (0.25 - newY2Offset);

			img.crop(
				Math.floor(baseX1 * img.bitmap.width),
				Math.floor(baseY1 * img.bitmap.height),
				Math.floor(baseX2 * img.bitmap.width),
				Math.floor(baseY2 * img.bitmap.height)
			);
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