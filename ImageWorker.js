class CanvasWorker {

	constructor(oCanvas) {
		this._oCanvas = oCanvas;
		this._oContext = oCanvas.getContext('2d');
		this._oImageData = this._oContext.getImageData(0, 0, oCanvas.width, oCanvas.height);
		this._oCurrentImageData = this._oContext.getImageData(0, 0, oCanvas.width, oCanvas.height);
	}

	getImageData() {
		return this._oImageData;
	}

	getCurrentImageData() {
		return this._oCurrentImageData;
	}

	getWidth() {
		return this._oCanvas.width;
	}

	getHeight() {
		return this._oCanvas.height;
	}

	setWidth(iWidth) {
		this._oCanvas.width = iWidth;
	}

	setHeight(iHeight) {
		this._oCanvas.height = iHeight;
	}

	getContext() {
		return this._oContext;
	}

	getPixel(iX, iY) {
		return [0, 1, 2, 3]
			.map(iColorIndex => this._oCurrentImageData
				.data[iX * this._oImageData.width * 4 + iY * 4 + iColorIndex]);
	}

	setPixel(aPixel, iX, iY) {
		[0, 1, 2, 3]
			.forEach(
				iColorIndex => this._oImageData
					.data[iX * this._oImageData.width * 4 + iY * 4 + iColorIndex] = aPixel[iColorIndex]);
	}

	saveImageData() {
		this._oContext.putImageData(this._oImageData, 0, 0);
	}

	resetImageData() {
		this._oImageData = this.getCurrentImageData();
	}

	clear() {
		this._oContext.clearRect(0, 0, this._oCanvas.width, this._oCanvas.height);
	}

	getBinArray() {
		let aBinArray = [];
		for (let i = 0; i < this.getWidth(); i++) {
			aBinArray[i] = [];
			for (let j = 0; j < this.getHeight(); j++) {
				let pixel = this.getPixel(i, j);
				if ( isBlackPixel(pixel) ) {
					aBinArray[i][j] = 1
				} else if( isWhitePixel(pixel) ) {
					aBinArray[i][j] = 0;
				}
			}
		}
		return aBinArray;
	}

	/*shadeImage() {
		let aBinArray = this.getBinArray();
		let aShadedArray = [];
		aBinArray.forEach((aRow, iX) => {
			aShadedArray[ix] = [];
			aBinArray.forEach((iPixel, iY) => {
				if (iPixel !== 1) {

				}
			});
		});
	}*/

	/*getSurroundingPixels(iX, iY, iWave) {
		let aBinArray = this.getBinArray();
		let aSurroundingPixels = [];
		for(let i = 0; i < 9 * iWave; i++) {
			mPixel = {};
			mPixel.iX = iX;
			mPixel.
		}
	}*/
}
