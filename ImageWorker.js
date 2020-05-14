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

	setImageData(oImageData) {
		this._oContext.putImageData(oImageData, 0, 0);
		this._oImageData = oImageData;
		this._oCurrentImageData = oImageData;
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

	getHalftoneMatrix() {
		let aHalftoneMatrix = [];
		for (let i = 0; i < this.getWidth(); i++) {
			aHalftoneMatrix[i] = [];
			for (let j = 0; j < this.getHeight(); j++) {
				let pixel = this.getPixel(i, j);
				aHalftoneMatrix[i][j] = pixel[0];
			}
		}
		return aHalftoneMatrix;
	}

	shadeImage() {
		let aBinArray = this.getBinArray();
		let aShadedArray = [];
		aBinArray.forEach((aRow, iX) => {
			aShadedArray[iX] = [];
			aRow.forEach((iPixel, iY) => {
				if (iPixel !== 1) {
					let mPixel = this._findChessNearestValue(iX, iY, elem => {
						return elem.value === 1;
					});
					aShadedArray[iX][iY] = -this.getChessLength(iX, iY, mPixel.iX, mPixel.iY);
				} else if (this._getSurroundingValue(iX, iY, 0) === undefined) {
					let mPixel = this._findChessNearestValue(iX, iY, elem => {
						return elem.value === 1 && this._getSurroundingValue(elem.iX, elem.iY, 0) !== undefined;
					});
					aShadedArray[iX][iY] = this.getChessLength(iX, iY, mPixel.iX, mPixel.iY) + 1;
				} else {
					aShadedArray[iX][iY] = 1;
				}
			});
		});
		let aDistanceArray = aShadedArray.slice();
		let mGradations = this._createGradation(aShadedArray);
		aShadedArray = aShadedArray.map(aRow => {
			return aRow.map(elem => {
				return mGradations[String(elem)];
			});
		});
		aShadedArray.forEach((aRow, iX) => {
			aRow.forEach((elem, iY) => {
				this.setPixel(this._formGrayPixel(elem), iX, iY);
			});
		});
		let oImageData = this._oImageData;
		this.resetImageData();
		return [aShadedArray, oImageData, aDistanceArray];
	}

	binarizeImage(iThresHold) {
		let aHalftoneMatrix = this.getHalftoneMatrix(),
		    aBinMatrix = [];
		aHalftoneMatrix.forEach((aRow, iX) => {
			aBinMatrix[iX] = [];
			aRow.forEach((iPixel, iY) => {
			    let aFirstWave = this.getSurroundingHalftonePixels(iX, iY, 1),
			        aPixel,
			        iBinPixel;
			    for (let i = 0; i < aFirstWave.length; i++) {
			    	if (aFirstWave[i].value <= iThresHold) {
			    	    aPixel =  [0, 0, 0, 255];
			    	    iBinPixel = 1;
			    	    break;
			    	}
			    	aPixel = [255, 255, 255];
			    	iBinPixel = 0;
			    }
			    this.setPixel(aPixel, iX, iY);
			    aBinMatrix[iX][iY] = iBinPixel;
			});
		});
		let oImageData = this._oImageData;
		this.resetImageData();
		return [oImageData, aBinMatrix];
	}

	_formGrayPixel(iGreyScale) {
		return [iGreyScale, iGreyScale, iGreyScale, 255];
	}

	_createGradation(aShadedArray) {
		let aGradations = [];
		let mGradations = {};
		aShadedArray.forEach(aRow => {
			aRow.forEach(elem => {
				if (!aGradations.includes(elem)) {
					aGradations.push(elem);
				}
			});
		});
		let gradationStep = 255 / (aGradations.length - 1);
		let gradation = 255;
		aGradations.sort((elem1, elem2) => {
			return elem1 - elem2;
		});
		aGradations = aGradations.forEach(elem => {
			mGradations[String(elem)] = gradation;
			gradation -= gradationStep;
		});
		return mGradations;
	}

	_findChessNearestValue(iX, iY, fCondition) {
		let mPixel = undefined;
		let iWave = 1;
		while (mPixel === undefined) {
			mPixel = this.getSurroundingPixels(iX, iY, iWave).find(fCondition);
			iWave++;
		}
		return mPixel;
	}

	_getSurroundingValue(iX, iY, value) {
		return this.getSurroundingPixels(iX, iY, 1).find(elem => elem.value === value);
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

	getSurroundingHalftonePixels(iX, iY, iWave) {
		let aHalftoneMatrix = this.getHalftoneMatrix();
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
			if ((iX + iTempX) < 0 || (iY + iTempY) < 0 || (iX + iTempX) >= aHalftoneMatrix.length
				|| (iY + iTempY) >= aHalftoneMatrix[0].length ) {
				continue;

			}
			mPixel.iX = iX + iTempX;
			mPixel.iY = iY + iTempY;
			mPixel.value = aHalftoneMatrix[iX + iTempX][iY + iTempY];
			aSurroundingPixels.push(mPixel);
		}
		return aSurroundingPixels;
	}

	static getImageDataFromMatrix (pixelMatrix){
		let oImageData = new ImageData(pixelMatrix.length, pixelMatrix[0].length),
		    iImageDataIndex = 0;
		pixelMatrix.forEach( (row, i) => {
			row.forEach( (pixel, j) => {
				let color = pixel === 1 ? 0 : 255;
				oImageData.data[iImageDataIndex] = color;
				iImageDataIndex++;
				oImageData.data[iImageDataIndex] = color;
				iImageDataIndex++;
				oImageData.data[iImageDataIndex] = color;
				iImageDataIndex++;
				oImageData.data[iImageDataIndex] = 255;
				iImageDataIndex++;
			});
		});
		return oImageData;
	}

	static getEroziaMatrix (binMatrix, mask) {
		const watchingIndexes = [], resultMatrix = [];
		for (let i = 0; i < mask.length; i += 1) {
			for (let j = 0; j < mask[i].length; j += 1) {
				if (mask[i][j] === 1 && !(i === j && i === 1)) {
					watchingIndexes.push([i - 1, j - 1]);
				}
			}
		}
		console.log(watchingIndexes)
		for (let i = 0; i < binMatrix.length; i += 1) {
			const resultRow = [];
			for (let j = 0; j < binMatrix[i].length; j += 1) {
				if (binMatrix[i][j] === 1) {
					const res = [];
					for (const [diffI, diffJ] of watchingIndexes) {
						if (binMatrix[i + diffI] && binMatrix[i + diffI][j + diffJ] !== undefined) {
							if (binMatrix[i + diffI][j + diffJ] === 1) {
								res.push(true);
							} else {
								res.push(false);
							}
						} else {
							res.push(false);
						}
					}

					if (res.every(el => !!el)) {
						resultRow.push(1);
					} else {
						resultRow.push(0);
					}
				} else {
					resultRow.push(0);
				}
			}
			resultMatrix.push(resultRow);
		}
		return resultMatrix;
	}

	static getRashirenieMatrix (binMatrix, mask) {
		const watchingIndexes = [], resultMatrix = [];
		for (let i = 0; i < mask.length; i += 1) {
			for (let j = 0; j < mask[i].length; j += 1) {
				if (mask[i][j] === 1 && !(i === j && i === 1)) {
					watchingIndexes.push([i - 1, j - 1]);
				}
			}
		}
		for (let i = 0; i < binMatrix.length; i += 1) {
			const resultRow = [];
			for (let j = 0; j < binMatrix[i].length; j += 1) {
				if (binMatrix[i][j] === 0) {
					const res = [];
					for (const [diffI, diffJ] of watchingIndexes) {
						if (binMatrix[i + diffI] && binMatrix[i + diffI][j + diffJ] !== undefined) {
							if (binMatrix[i + diffI][j + diffJ] === 1) {
								res.push(true);
							} else {
								res.push(false);
							}
						} else {
							res.push(false);
						}
					}
					if (res.some(el => !!el)) {
						resultRow.push(1);
					} else {
						resultRow.push(0);
					}
				} else {
					resultRow.push(0);
				}
			}
			resultMatrix.push(resultRow);
		}
		return resultMatrix;
	}
}
