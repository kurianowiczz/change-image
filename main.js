// Works on arrays of primitives
function equals(arr) {
	return this.every((el, index) => el === arr[index]);
}

Array.prototype.equals = equals;

const sourceCanvas = document.getElementsByClassName('source-img')[0],
	finishCanvas = document.getElementsByClassName('finish-img')[0],
	filteredHalftoneCanvas = document.getElementsByClassName('filtered-halftone')[0],
	sourceCtx = sourceCanvas.getContext('2d'),
	finishCtx = finishCanvas.getContext('2d'),
	filteredHalftoneCtx = filteredHalftoneCanvas.getContext('2d'),
    image = new Image(),
    halftoneImage = new Image(),
    binaryImageFileInput = document.getElementsByClassName('binary-image-file-input')[0],
    halftoneImageFileInput = document.getElementsByClassName('halftone-image-file-input')[0],
	imageMatrixSpan = document.getElementsByClassName('imageMatrix')[0],
	imageMatrixSpanNew = document.getElementsByClassName('imageMatrixNew')[0],
	imageMatrixSpanDistance = document.getElementsByClassName('imageMatrixNewDistance')[0],
	binarizeThresholdInput = document.getElementsByClassName('binarize-threshold-input')[0],
	binarizeThresholdInputLabel = document.getElementsByClassName('binarize-threshold-input-label')[0];

let jqMaskContainer,
    jqfilteredHalftoneCanvas = $(filteredHalftoneCanvas),
    jqfilteredHalftoneMatrix;

const gistograms = document.getElementsByClassName('gistograma');

const filterHalftoneWithMedian = canvasWorker => {
	let [oFilteredHalftoneImageData, aFilteredHalftoneMatrix] = canvasWorker.filterHalftoneWithMedian(),
	    sPixelMatrix = '';
	filteredHalftoneCanvas.width = finishCanvas.width;
	filteredHalftoneCanvas.height = finishCanvas.height;
	filteredHalftoneCtx.putImageData(oFilteredHalftoneImageData, 0, 0);
	for (let i = 0; i < aFilteredHalftoneMatrix.length; i++) {
        for (let j = 0; j < aFilteredHalftoneMatrix[0].length; j++) {
            sPixelMatrix += numberDecoratorFilter(aFilteredHalftoneMatrix[i][j]);
        }
    }
    jqfilteredHalftoneMatrix.html(sPixelMatrix);
	jqfilteredHalftoneMatrix.attr('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 3px 3px;
    `);
};

const shadeImage = canvasWorker => {
	const [newMatrix, rastushevkaDataSet] = writePixelMatrixNew(canvasWorker);
    const newMatrixDistance = writePixelMatrixDistance(canvasWorker);

    imageMatrixSpanNew.innerHTML = newMatrix;
    imageMatrixSpanDistance.innerHTML = newMatrixDistance;

    imageMatrixSpanNew.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 3px 3px;
    `);
    imageMatrixSpanDistance.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 3px 3px;
    `);

    const rastushevka = {};
    for (const tone of rastushevkaDataSet) {
        if (rastushevka[tone]) {
            rastushevka[tone] += 1;
        } else {
            rastushevka[tone] = 1;
        }
    }
    const chart2 = new Chart(
        gistograms[1].getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(rastushevka),
                datasets: [{
                    label: 'rastushevka',
                    data: Object.values(rastushevka),
                }],
            },
            options: {},
        },
    );
};

const binarizeImage = (canvasWorker, iThreshold) => {
    const [matrix, binDataSet] = writeBinarizedMatrix(canvasWorker, iThreshold);
    imageMatrixSpan.innerHTML = matrix;
    imageMatrixSpan.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 3px 3px;
    `);
    const binary = {};
    for (const bin of binDataSet) {
        if (binary[bin]) {
            binary[bin] += 1;
        } else {
            binary[bin] = 1;
        }
    }
    const chart1 = new Chart(
        gistograms[0].getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(binary),
                datasets: [{
                    label: 'binary',
                    data: Object.values(binary),
                }],
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,
                        },
                    }],
                },
            },
        },
    );
};

image.addEventListener('load', () => {
	jqfilteredHalftoneCanvas.addClass('hidden');
	jqfilteredHalftoneMatrix.remove();
	jqMaskContainer.removeClass('hidden');
	sourceCanvas.width = image.width;
	sourceCanvas.height = image.height;
    sourceCtx.drawImage(image, 0, 0);
    const canvasWorker = new CanvasWorker(sourceCanvas);
    const [matrix, binDataSet, aBinArray] = writePixelMatrix(canvasWorker);
    localStorage.setItem('binArray', JSON.stringify(aBinArray));
    imageMatrixSpan.innerHTML = matrix;
    const doc = document.getElementsByClassName('pixel-edit');
    let isChanged = false;
    changePixel = oEvent => {
        if(!isChanged && oEvent.buttons == 1) {
            oEvent.target.innerHTML = '1';
            oEvent.target.style.backgroundColor = 'black';
            oEvent.target.style.color = 'white';
            isChanged = true;
        }
        if(!isChanged && oEvent.buttons == 2) {
            oEvent.target.innerHTML = '0';
            oEvent.target.style.backgroundColor = '#fafafa';
            oEvent.target.style.color = 'black';
            isChanged = true;
        }
        const doc = document.getElementsByClassName('pixel-edit');
	    let arr = [[]];
	    let counter = 0;
	    for (let i = 0, j = 0; i < doc.length; i++){
	        if(counter === Math.sqrt(doc.length)) {
	            j++;
	            arr[j] = [];
	            counter = 0;
	        }
	        arr[j].push(Number(doc[i].innerText));
	        counter++;
	    }
	    canvasWorker.setImageData(CanvasWorker.getImageDataFromMatrix(arr), 0, 0);
    };
    resetChanged = () => {
        isChanged = false;
    };
    for (let i = 0; i < doc.length; i++) {
        doc[i].addEventListener('mouseout',resetChanged);
        doc[i].addEventListener('mouseup', resetChanged);
        doc[i].addEventListener('mousedown', changePixel);
        doc[i].addEventListener('mouseover', changePixel)
    }
    imageMatrixSpan.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 3px 3px;
    `);
    const binary = {};
    for (const bin of binDataSet) {
        if (binary[bin]) {
            binary[bin] += 1;
        } else {
            binary[bin] = 1;
        }
    }
    const chart1 = new Chart(
        gistograms[0].getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(binary),
                datasets: [{
                    label: 'binary',
                    data: Object.values(binary),
                }],
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,
                        },
                    }],
                },
            },
        },
    );
    shadeImage(canvasWorker);
});

halftoneImage.addEventListener('load', () => {
	jqfilteredHalftoneCanvas.removeClass('hidden');
	jqfilteredHalftoneMatrix = $(`<div class="matrixContainer">
    <div class="filtered-halftone-image" style="display: grid;"></div>
</div>`);
	$(".matrixContainers").append(jqfilteredHalftoneMatrix);
	jqMaskContainer.addClass('hidden');
	finishCanvas.width = halftoneImage.width;
	finishCanvas.height = halftoneImage.height;
    finishCtx.drawImage(halftoneImage, 0, 0);
    const canvasWorker = new CanvasWorker(finishCanvas);
	const [newMatrix, rastushevkaDataSet] = writeHalfToneMatrix(canvasWorker);
    imageMatrixSpanNew.innerHTML = newMatrix;
    imageMatrixSpanNew.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 3px 3px;
    `);
    const rastushevka = {};
    for (const tone of rastushevkaDataSet) {
        if (rastushevka[tone]) {
            rastushevka[tone] += 1;
        } else {
            rastushevka[tone] = 1;
        }
    }
    const chart2 = new Chart(
        gistograms[1].getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(rastushevka),
                datasets: [{
                    label: 'rastushevka',
                    data: Object.values(rastushevka),
                }],
            },
            options: {},
        },
    );
    binarizeImage(canvasWorker);
    filterHalftoneWithMedian(canvasWorker);
});

binaryImageFileInput.addEventListener('change', () => {
	image.src = "";
	image.src = window.URL.createObjectURL(binaryImageFileInput.files[0]);
});

halftoneImageFileInput.addEventListener('change', () => {
	halftoneImage.src = "";
	halftoneImage.src = window.URL.createObjectURL(halftoneImageFileInput.files[0]);
});

const numberDecorator = (num) => `
<div style="
	padding: 4px 10px;
	background-color: #fafafa;
	color: black;
	border-radius: 3px;
	">
	${num}
</div>
`;

const numberDecoratorNew = (num) => `
<div style="
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgb(${new Array(3).fill(255 - num > 127 ? 255 : 0).join(', ')});
	background-color: rgb(${new Array(3).fill(num).join(', ')});
	border-radius: 3px;
	">
	${Math.round(num)}
</div>
`;

const numberDecoratorFilter = (num) => `
<div class="filter-pixel" style="
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgb(${new Array(3).fill(255 - num > 127 ? 255 : 0).join(', ')});
	background-color: rgb(${new Array(3).fill(num).join(', ')});
	border-radius: 3px;
	">
	${Math.round(num)}
</div>
`;

const numberDecoratorSave = (num) => `
<div class="pixel-edit" style="
	padding: 4px 10px;
	background-color: ${num ? 'black': '#fafafa'};
	color: ${num ? 'white' : 'black'};
	border-radius: 3px;
	cursor: default;
	">
	${num}
</div>
`;

const writeHalfToneMatrix = (canvasWorker) => {
	const rastushevkaDataSet = [];
	let sPixelMatrix = '';
	let aHalftoneMatrix = canvasWorker.getHalftoneMatrix();
	for (let i = 0; i < aHalftoneMatrix.length; i++) {
		for (let j = 0; j < aHalftoneMatrix[0].length; j++) {
			rastushevkaDataSet.push(Math.round(aHalftoneMatrix[i][j]));
			sPixelMatrix += numberDecoratorNew(aHalftoneMatrix[i][j]);
		}
	}
	return [sPixelMatrix, rastushevkaDataSet];
};

const writeBinarizedMatrix = (canvasWorker, iThreshold) => {
	let iThresholdCopy = iThreshold;
	if (!iThresholdCopy) {
		let aHalftoneMatrix = canvasWorker.getHalftoneMatrix(),
		    iPixelsSum = 0,
		    iPixelsNumber = aHalftoneMatrix.length * aHalftoneMatrix.length;
		aHalftoneMatrix.forEach(aRow => {
			aRow.forEach(iPixel => {
				iPixelsSum += iPixel;
			}); 
		});
		iThresholdCopy = iPixelsSum / iPixelsNumber;
		binarizeThresholdInput.value = Math.round(iThresholdCopy);
		iThresholdCopy = 255 - iThresholdCopy;
		binarizeThresholdInputLabel.innerHTML = "Choose Threshold: " + Math.round(iThresholdCopy);
	}
	const binDataSet = [];
	let sPixelMatrix = '';
	let [oImageData, aBinArray] = canvasWorker.binarizeImage(iThresholdCopy);
	sourceCtx.putImageData(oImageData, 0, 0);
	for (let i = 0; i < aBinArray.length; i++) {
		for (let j = 0; j < aBinArray[0].length; j++) {
			binDataSet.push(aBinArray[i][j]);
			sPixelMatrix += numberDecoratorSave(aBinArray[i][j]);
		}
	}
	return [sPixelMatrix, binDataSet];
};

const writePixelMatrix = (canvasWorker) => {
    const binDataSet = [];
    let sPixelMatrix = '';
    let aBinArray = canvasWorker.getBinArray();
    for (let i = 0; i < aBinArray.length; i++) {
        for (let j = 0; j < aBinArray[0].length; j++) {
            binDataSet.push(aBinArray[i][j]);
            sPixelMatrix += numberDecoratorSave(aBinArray[i][j]);
        }
    }
    return [sPixelMatrix, binDataSet, aBinArray];
};

const writePixelMatrixNew = (canvasWorker) => {
	const rastushevkaDataSet = [];
	let sPixelMatrix = '';
	let aShadedImageAndData = canvasWorker.shadeImage();
	finishCanvas.width = image.width;
	finishCanvas.height = image.height;
	finishCanvas.getContext('2d').putImageData(aShadedImageAndData[1], 0, 0);
	for (let i = 0; i < aShadedImageAndData[0].length; i++) {
		for (let j = 0; j < aShadedImageAndData[0][0].length; j++) {
			rastushevkaDataSet.push(Math.round(aShadedImageAndData[0][i][j]));
			sPixelMatrix += numberDecoratorNew(aShadedImageAndData[0][i][j]);
		}
	}
	return [sPixelMatrix, rastushevkaDataSet];
};

const writePixelMatrixDistance = (canvasWorker) => {
    let sPixelMatrix = '';
    let aDistanceArray = canvasWorker.shadeImage();
    for (let i = 0; i < aDistanceArray[2].length; i++) {
        for (let j = 0; j < aDistanceArray[2][0].length; j++) {
            sPixelMatrix += numberDecorator(aDistanceArray[2][i][j]);
        }
    }
    return sPixelMatrix;
};

const isBlackPixel = (pixel) => [0, 0, 0, 255].equals(pixel);

const isWhitePixel = (pixel) => [255, 255, 255, 255].equals(pixel);



