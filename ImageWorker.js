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

	shadeImage() {
		let aBinArray = this.getBinArray();
		let aShadedArray = [];
		aBinArray.forEach((aRow, iX) => {
			aShadedArray[iX] = [];
			aBinArray.forEach((iPixel, iY) => {
				if (iPixel !== 1) {
					let mPixel = undefined;
					let iWave = 1;
					while (mPixel === undefined) {
						mPixel = this.getSurroundingPixels(iX, iY, iWave).find( elem => {
							return elem.value === 1;
						});
						iWave++;
					}
					aShadedArray[iX][iY] = -this.getChessLength(iX, iY, mPixel.iX, mPixel.iY);
				} else if (this.getSurroundingPixels(iX, iY, 1)) {

				}
			});
		});
		return aShadedArray;
	}

	getChessLength(iX1, iY1, iX2, iY2) {
		const W0 = 0;
		const W1 = 1;
		let result = -1;
		if (Math.abs(iX1 - iX2) < Math.abs(iY1 - iY2)) {
			result = W0 * Math.abs(iX1 - iX2) + W1 * Math.abs(iY1 - iY2);
		} else {
			result = W1 * Math.abs(iX1 - iX2) + W0 * Math.abs(iY1 - iY2);
		}
		return result;

	}

	getSurroundingPixels(iX, iY, iWave) {
		let aBinArray = this.getBinArray();
		let aSurroundingPixels = [];
		let iTempX = iWave;
		let iTempY = iWave;
		for(let i = 0; i < 8 * iWave; i++) {
			let mPixel = {};
			if( iTempX >= (-iWave + 1) && iTempX <= iWave && iTempY === iWave ) {
				iTempX -= 1;
			} else if (iTempX === -iWave && iTempY >= (-iWave + 1) && iTempY <= iWave ) {
				iTempY -= 1;
			} else if (iTempX >= -iWave && iTempX <= (iWave - 1) && iTempY === -iWave) {
				iTempX += 1;
			} else  if (iTempX === iWave && iTempY >= -iWave && iTempY <= (iWave - 1)) {
				iTempY += 1;
			}
			if ((iX + iTempX) < 0 || (iY + iTempY) < 0 || (iX + iTempX) >= aBinArray.length
				|| (iY + iTempY) >= aBinArray[0].length ) {
				continue;

			}
			mPixel.iX = iX + iTempX;
			mPixel.iY = iY + iTempY;
			mPixel.value = aBinArray[iX + iTempX][iY + iTempY];
			aSurroundingPixels.push(mPixel);
		}
		return aSurroundingPixels;
	}
}
