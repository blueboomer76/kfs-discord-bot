function getPixelFactor(img) {
	return Math.ceil((img.bitmap.width > img.bitmap.height ? img.bitmap.width : img.bitmap.height) / 100);
}

module.exports.applyJimpFilter = (img, filter, options) => {
	switch (filter) {
		case "blur":
			img.blur(options.blur || getPixelFactor(img));
			break;
		case "flip":
			img.flip(true, false);
			break;
		case "flop":
			img.flip(false, true);
			break;
		case "grayscale":
			img.grayscale();
			break;
		case "invert":
			img.invert();
			break;
		case "pixelate":
			img.pixelate(options.pixels || getPixelFactor(img));
			break;
		case "randomcrop":
			const baseX1 = Math.random() * 0.25,
				baseY1 = Math.random() * 0.25,
				baseX2 = 1 - Math.random() * 0.25,
				offsetSum = baseX1 + baseY1 + (1 - baseX2),
				newY2Offset = offsetSum < 0.1 ? 0.1 - offsetSum : 0,
				baseY2 = (1 - newY2Offset) - Math.random() * (0.25 - newY2Offset);

			img.crop(
				Math.floor(baseX1 * img.bitmap.width),
				Math.floor(baseY1 * img.bitmap.height),
				Math.floor((baseX2 - baseX1) * img.bitmap.width),
				Math.floor((baseY2 - baseY1) * img.bitmap.height)
			);
			break;
		case "rotate":
			img.rotate(options.rotation || 90);
			break;
		case "sepia":
			img.sepia();
			break;
	}
};
