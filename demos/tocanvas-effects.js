var effects = {
	greyscale: function (pixels, i) {
		var r = i, g = i+1, b = i+2, a = i+3;
		pixels[r] = pixels[g] = pixels[b] = (3 * pixels[r] + 4 * pixels[g] + pixels[b]) >>> 3;
	},
	ascii: function (data, i, width) {
		var linebreak = (i/4 % width) ? '' : '<br>';
		var gray = 255 - data[i];

		if (gray < 20) {
			return '&nbsp;' + linebreak;
		}
		if (gray < 40) {
			return '·' + linebreak;
		}
		if (gray < 60) {
			return ':' + linebreak;
		}
		if (gray < 100) {
			return '-' + linebreak;
		}
		if (gray < 150) {
			return '+' + linebreak;
		}
		if (gray < 200) {
			return '@' + linebreak;
		}
		return '#' + linebreak;
	},
	chroma: function (pixels, i) {
		var r = i, g = i+1, b = i+2, a = i+3;

		if (pixels[g] > 100 && pixels[r] > 100 && pixels[b] < 43) {
			pixels[a] = 0;
		}
	}
};