class CanvasWorker {

	constructor(oCanvas) {
		this._oCanvas = oCanvas;
		this._oContext = oCanvas.getContext("2d");
		this._oImageData = this._oContext.getImageData(0, 0, oCanvas.width, oCanvas.height);
	}

	getImageData() {
		return this._oImageData();
	}

	getCurrentImageData() {
		return this._oContext.getImageData(0, 0, this.getWidth(), this.getHeight());
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
		let oImageData = this.getCurrentImageData(),
			aPixel = [];
		for (let iColorIndex = 0; iColorIndex < 4; iColorIndex++) {
			aPixel.push(oImageData.data[iX * oImageData.width * 4 + iY * 4 + iColorIndex]);
		}
		return aPixel;
	}

	setPixel(aPixel, iX, iY) {
		for (let iColorIndex = 0; iColorIndex < 4; iColorIndex++) {
			this._oImageData.data[iX * this._oImageData.width * 4 + iY * 4 + iColorIndex] = aPixel[iColorIndex];
		}
	}

	saveImageData() {
		this._oContext.putImageData(this._oImageData, 0, 0);
	}

	resetImageData() {
		this._oImageData = this.getFullImageData();
	}

	clear() {
		this._oContext.clearRect(0, 0, this._oCanvas.width, this._oCanvas.height);
	}
}