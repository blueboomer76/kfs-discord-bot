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
		case "greyscale":
			img.greyscale();
			break;
		case "invert":
			img.invert();
			break;
		case "pixelate":
			img.pixelate(options.pixels || getPixelFactor(img));
			break;
		case "randomcrop":
			img.crop(
				Math.floor(Math.random() * img.bitmap.width * 0.25),
				Math.floor(Math.random() * img.bitmap.height * 0.25),
				Math.floor(img.bitmap.width * (0.5 + Math.random() * 0.25)),
				Math.floor(img.bitmap.height * (0.5 + Math.random() * 0.25))
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