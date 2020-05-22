// Works on arrays of primitives
function equals(arr) {
    return this.every((el,index)=>el === arr[index]);
}

Array.prototype.equals = equals;

const sourceCanvas = document.getElementsByClassName('source-img')[0]
  , finishCanvas = document.getElementsByClassName('finish-img')[0]
  , filteredHalftoneCanvas = document.getElementsByClassName('filtered-halftone')[0]
  , downloadsCanvasColor = document.getElementsByClassName('color-img')[0]
  , shadedImageCanvas = document.getElementsByClassName('shaded-img')[0]
  , binarizedCanvas = document.getElementsByClassName('binarized-img')[0]
  , binarizedCtx = binarizedCanvas.getContext('2d')
  , shadedImageCtx = shadedImageCanvas.getContext('2d')
  , sourceCtx = sourceCanvas.getContext('2d')
  , finishCtx = finishCanvas.getContext('2d')
  , filteredHalftoneCtx = filteredHalftoneCanvas.getContext('2d')
  , image = new Image()
  , halftoneImage = new Image()
  , colorImage = new Image()
  , binaryImageFileInput = document.getElementsByClassName('binary-image-file-input')[0]
  , halftoneImageFileInput = document.getElementsByClassName('halftone-image-file-input')[0]
  , colorImageFileInput = document.getElementsByClassName('color-image-file-input')[0]
  , imageShadedMatrix = document.getElementsByClassName('shaded-matrix')[0]
  , imageMatrixSpan = document.getElementsByClassName('imageMatrix')[0]
  , imageMatrixSpanNew = document.getElementsByClassName('imageMatrixNew')[0]
  , imageMatrixBinarized = document.getElementsByClassName('binarizedMatrix')[0]
  , imageMatrixSpanNewColor = document.getElementsByClassName('imageMatrixNewColor')[0]
  , imageMatrixSpanNewColorRed = document.getElementsByClassName('imageMatrixNewColorRed')[0]
  , imageMatrixSpanNewColorGreen = document.getElementsByClassName('imageMatrixNewColorGreen')[0]
  , imageMatrixSpanNewColorBlue = document.getElementsByClassName('imageMatrixNewColorBlue')[0]
  , imageMatrixSpanDistance = document.getElementsByClassName('imageMatrixNewDistance')[0]
  , binarizeThresholdInput = document.getElementsByClassName('binarize-threshold-input')[0]
  , binarizeThresholdInputLabel = document.getElementsByClassName('binarize-threshold-input-label')[0];

let jqMaskContainer, jqfilteredHalftoneCanvas = $(filteredHalftoneCanvas), jqfilteredHalftoneMatrix = $(`<div class="matrixContainer">
    <div class="filtered-halftone-image" style="display: grid;"></div>
</div>`);

const gistograms = document.getElementsByClassName('gistograma');

const filterHalftoneWithMedian = canvasWorker=>{
    let[oFilteredHalftoneImageData,aFilteredHalftoneMatrix] = canvasWorker.filterHalftoneWithMedian()
      , sPixelMatrix = '';
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
}
;

const binarizeImage = (canvasWorker,iThreshold)=>{
    const [matrix,binDataSet] = writeBinarizedMatrix(canvasWorker, iThreshold);
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
    const chart1 = new Chart(gistograms[0].getContext('2d'),{
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
    },);
}
;

const binarizeImage2 = (canvasWorker,iThreshold)=>{
    const [matrix,binDataSet] = writeBinarizedMatrix2(canvasWorker, iThreshold);
    imageMatrixBinarized.innerHTML = matrix;
    imageMatrixBinarized.setAttribute('style', `
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
    const chart1 = new Chart(gistograms[0].getContext('2d'),{
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
    },);
}
;

const shadeImage = canvasWorker=>{
    const [newMatrix,rastushevkaDataSet] = writePixelMatrixNew(canvasWorker);
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
    const chart2 = new Chart(gistograms[1].getContext('2d'),{
        type: 'bar',
        data: {
            labels: Object.keys(rastushevka),
            datasets: [{
                label: 'rastushevka',
                data: Object.values(rastushevka),
            }],
        },
        options: {},
    },);
}
;

const shadeImage2 = canvasWorker=>{
    const [newMatrix,rastushevkaDataSet] = writePixelMatrixNew2(canvasWorker);
    const newMatrixDistance = writePixelMatrixDistance2(canvasWorker);

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
    const chart2 = new Chart(gistograms[1].getContext('2d'),{
        type: 'bar',
        data: {
            labels: Object.keys(rastushevka),
            datasets: [{
                label: 'rastushevka',
                data: Object.values(rastushevka),
            }],
        },
        options: {},
    },);
}
;

const colorfulImage = (canvasWorker)=>{
    const [matrixColor,colorDataSet] = writeColorMatrixRed(canvasWorker);
    imageMatrixSpanNewColor.innerHTML = matrixColor;
    imageMatrixSpanNewColor.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 3px 3px;
    `);

    const colorful = {};
    for (const color of colorDataSet) {
        if (colorful[color]) {
            colorful[color] += 1;
        } else {
            colorful[color] = 1;
        }
    }
    const chart3 = new Chart(gistograms[0].getContext('2d'),{
        type: 'bar',
        data: {
            labels: Object.keys(colorful),
            datasets: [{
                label: 'color',
                data: Object.values(colorful),
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
    },);
}
;

image.addEventListener('load', ()=>{
    jqfilteredHalftoneCanvas.addClass('hidden');
    jqfilteredHalftoneMatrix.remove();
    jqMaskContainer.removeClass('hidden');
    sourceCanvas.width = image.width;
    sourceCanvas.height = image.height;
    sourceCtx.drawImage(image, 0, 0);
    const canvasWorker = new CanvasWorker(sourceCanvas);
    const [matrix,binDataSet,aBinArray] = writePixelMatrix(canvasWorker);
    localStorage.setItem('binArray', JSON.stringify(aBinArray));
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
    const chart1 = new Chart(gistograms[0].getContext('2d'),{
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
    },);
    shadeImage(canvasWorker);
}
);

halftoneImage.addEventListener('load', async()=>{
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
    const [newMatrix,rastushevkaDataSet] = writeHalfToneMatrix(canvasWorker);
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
    const chart2 = new Chart(gistograms[1].getContext('2d'),{
        type: 'bar',
        data: {
            labels: Object.keys(rastushevka),
            datasets: [{
                label: 'rastushevka',
                data: Object.values(rastushevka),
            }],
        },
        options: {},
    },);
    binarizeImage(canvasWorker);
    filterHalftoneWithMedian(canvasWorker);
    colorfulImage(canvasWorker);
}
);

colorImage.addEventListener('load', ()=>{
    sourceCanvas.width = colorImage.width;
    sourceCanvas.height = colorImage.height;
    sourceCtx.drawImage(colorImage, 0, 0);
    const canvasWorker = new CanvasWorker(sourceCanvas);
    const [matrixColor,colorDataSet,aColorMatrix,sRed,sGreen,sBlue] = writeColorMatrix(canvasWorker);
    // imageMatrixSpanNewColor.innerHTML = matrixColor;
    // imageMatrixSpanNewColor.setAttribute('style', `
    // display: grid;
    // grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    // grid-gap: 1px 1px;
    // `);
    const docRed = document.getElementsByClassName('imageMatrixNewColorRed');
    const docGreen = document.getElementsByClassName('imageMatrixNewColorGreen');
    const docBlue = document.getElementsByClassName('imageMatrixNewColorBlue');
    changeRedPixel = (oEvent) => {
		let sBrightness = prompt("Введите яркость пикселя")
		oEvent.target.innerHTML = sBrightness;
		oEvent.target.style.color = 'white';
		oEvent.target.style.backgroundColor = 'rgb('+ sBrightness +',0,0)';
		isChanged = true;
        let arr = [[]];
        let counter = 0;
        for (let i = 0, j = 0; i < docRed.length; i++) {
            if (counter === Math.sqrt(docRed.length)) {
                j++;
                arr[j] = [];
                counter = 0;
            }
            arr[j].push(Number(docRed[i].innerText));
            counter++;
        }
        canvasWorker.setImageData(CanvasWorker.getImageDataFromMatrix(arr), 0, 0);
    };
    changeGreenPixel = (oEvent) => {
		let sBrightness = prompt("Введите яркость пикселя")
		oEvent.target.innerHTML = sBrightness;
		oEvent.target.style.color = 'white';
		oEvent.target.style.backgroundColor = 'rgb(0,' + sBrightness + ',0)';
		isChanged = true;
        let arr = [[]];
        let counter = 0;
        for (let i = 0, j = 0; i < docGreen.length; i++) {
            if (counter === Math.sqrt(docGreen.length)) {
                j++;
                arr[j] = [];
                counter = 0;
            }
            arr[j].push(Number(docGreen[i].innerText));
            counter++;
        }
        canvasWorker.setImageData(CanvasWorker.getImageDataFromMatrix(arr), 0, 0);
    };
    changeBluePixel = (oEvent) => {
		let sBrightness = prompt("Введите яркость пикселя")
		oEvent.target.innerHTML = sBrightness;
		oEvent.target.style.color = 'white';
		oEvent.target.style.backgroundcolor = 'rgb(0,0,'+ sBrightness + ')';
		isChanged = true;
        let arr = [[]];
        let counter = 0;
        for (let i = 0, j = 0; i < docBlue.length; i++) {
            if (counter === Math.sqrt(docBlue.length)) {
                j++;
                arr[j] = [];
                counter = 0;
            }
            arr[j].push(Number(docBlue[i].innerText));
            counter++;
        }
        canvasWorker.setImageData(CanvasWorker.getImageDataFromMatrix(arr), 0, 0);
    };
        
    for (let i = 0; i < docRed.length; i++) {
        docRed[i].addEventListener('click', changeRedPixel);
        docGreen[i].addEventListener('click', changeGreenPixel);
        docBlue[i].addEventListener('click', changeBluePixel);
    }

    const inners = [matrixColor, sRed, sGreen, sBlue];
    [imageMatrixSpanNewColor, imageMatrixSpanNewColorRed, imageMatrixSpanNewColorGreen, imageMatrixSpanNewColorBlue].forEach((el,i)=>{
        console.log(el)
        el.setAttribute('style', `
    display: grid;
    grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
    grid-gap: 1px 1px;
    `);
        el.innerHTML = inners[i];
    }
    );

    const colorful = {};
    for (const color of colorDataSet) {
        if (colorful[color]) {
            colorful[color] += 1;
        } else {
            colorful[color] = 1;
        }
    }
    const chart3 = new Chart(gistograms[0].getContext('2d'),{
        type: 'bar',
        data: {
            labels: Object.keys(colorful),
            datasets: [{
                label: 'color',
                data: Object.values(colorful),
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
    },);
    writeHalftoneFromColored(canvasWorker);
    let halftoneCanvasWorker = new CanvasWorker(shadedImageCanvas);
    binarizeImage2(halftoneCanvasWorker);
    let binCanvasWorker = new CanvasWorker(binarizedCanvas);
    shadeImage2(binCanvasWorker);

}
);

binaryImageFileInput.addEventListener('change', ()=>{
    image.src = "";
    image.src = window.URL.createObjectURL(binaryImageFileInput.files[0]);
}
);

halftoneImageFileInput.addEventListener('change', ()=>{
    halftoneImage.src = "";
    halftoneImage.src = window.URL.createObjectURL(halftoneImageFileInput.files[0]);
}
);

colorImageFileInput.addEventListener('change', ()=>{
    colorImage.src = "";
    colorImage.src = window.URL.createObjectURL(colorImageFileInput.files[0]);
}
);

const numberDecorator = (num)=>`
<div style="
	padding: 4px 10px;
	background-color: #fafafa;
	color: black;
	border-radius: 3px;
	">
	${num}
</div>
`;

const numberDecoratorNew = (num)=>`
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

const numberDecoratorFilter = (num)=>`
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

const numberDecoratorSave = (num)=>`
<div class="pixel-edit" style="
	padding: 4px 10px;
	background-color: ${num ? 'black' : '#fafafa'};
	color: ${num ? 'white' : 'black'};
	border-radius: 3px;
	cursor: default;
	">
	${num}
</div>
`;

const numberDecoratorColor = (num)=>{
    const labels = ['red', 'green', 'blue', 'alpha'];
    return `
<div class="pixel-edit" style="
	background-color: rgba(${num.toString()});
	color: black;
	cursor: default;
	width: 32px;
	height: 32px;
	"
	onclick="alert('${num.map((color,index)=>labels[index] + ': ' + color).join(', ')}')"
	>
</div>
`;
}

const numberDecoratorRGB = (num,position)=>{
    let aPixel = [0, 0, 0, 255].map((el,i)=>i === position ? num : el);
    const labels = ['red', 'green', 'blue', 'alpha'];
    return `
<div class="pixel-edit" style="
	background-color: rgba(${aPixel});
	color: white;
	cursor: default;
	width: 32px;
	height: 32px;
	"
	>
	${aPixel[position]}
</div>
`;
}

const writeHalftoneFromColored = canvasWorker=>{
    const rastushevkaDataSet = [];
    const [oImageData,aHalftoneMatrix] = canvasWorker.getHalftoneFromColored();
    let sPixelMatrix = '';
    for (let i = 0; i < aHalftoneMatrix.length; i++) {
        for (let j = 0; j < aHalftoneMatrix[0].length; j++) {
            rastushevkaDataSet.push(Math.round(aHalftoneMatrix[i][j]));
            sPixelMatrix += numberDecoratorNew(aHalftoneMatrix[i][j]);
        }
    }
    shadedImageCanvas.width = colorImage.width;
    shadedImageCanvas.height = colorImage.height;
    shadedImageCtx.putImageData(oImageData, 0, 0);
    imageShadedMatrix.innerHTML = sPixelMatrix;
    imageShadedMatrix.setAttribute('style', `
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
    const chart2 = new Chart(gistograms[1].getContext('2d'),{
        type: 'bar',
        data: {
            labels: Object.keys(rastushevka),
            datasets: [{
                label: 'rastushevka',
                data: Object.values(rastushevka),
            }],
        },
        options: {},
    },);
}

const writeHalfToneMatrix = (canvasWorker)=>{
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
}
;

const writeColorMatrix = (canvasWorker)=>{
    const colorDataSet = [];
    let sPixelMatrix = ''
      , sRed = ''
      , sGreen = ''
      , sBlue = '';
    let aColorMatrix = canvasWorker.getColorMatrix();
    for (let i = 0; i < aColorMatrix.length; i += 1) {
        for (let j = 0; j < aColorMatrix[0].length; j++) {
            colorDataSet.push(aColorMatrix[i][j]);
            sPixelMatrix += numberDecoratorColor(aColorMatrix[i][j]);
            sRed += numberDecoratorRGB(aColorMatrix[i][j][0], 0);
            sGreen += numberDecoratorRGB(aColorMatrix[i][j][1], 1);
            sBlue += numberDecoratorRGB(aColorMatrix[i][j][2], 2);
        }
    }
    return [sPixelMatrix, colorDataSet, aColorMatrix, sRed, sGreen, sBlue];
}
;

// const writeColorMatrixRed = (canvasWorker) => {
//     const colorDataSet = [];
//     let sPixelMatrix = '';
//     let aColorMatrixRed = canvasWorker.getPixelsRedBrightness();
//     console.log(aColorMatrixRed)
//     for (let i = 0; i < aColorMatrixRed.length; i += 1) {
//         for (let j = 0; j < aColorMatrixRed[0].length; j++) {
//             colorDataSet.push(aColorMatrixRed[i][j]);
//             sPixelMatrix += numberDecoratorColor(aColorMatrixRed[i][j]);
//         }
//     }
//     return [sPixelMatrix, colorDataSet, aColorMatrixRed];
// };

const writeBinarizedMatrix = (canvasWorker,iThreshold)=>{
    let iThresholdCopy = iThreshold;
    if (!iThresholdCopy) {
        let aHalftoneMatrix = canvasWorker.getHalftoneMatrix()
          , iPixelsSum = 0
          , iPixelsNumber = aHalftoneMatrix.length * aHalftoneMatrix.length;
        aHalftoneMatrix.forEach(aRow=>{
            aRow.forEach(iPixel=>{
                iPixelsSum += iPixel;
            }
            );
        }
        );
        iThresholdCopy = iPixelsSum / iPixelsNumber;
        binarizeThresholdInput.value = Math.round(iThresholdCopy);
        iThresholdCopy = 255 - iThresholdCopy;
        binarizeThresholdInputLabel.innerHTML = "Choose Threshold: " + Math.round(iThresholdCopy);
    }
    sourceCanvas.width = halftoneImage.width;
    sourceCanvas.height = halftoneImage.height;
    const binDataSet = [];
    let sPixelMatrix = '';
    let[oImageData,aBinArray] = canvasWorker.binarizeImage(iThresholdCopy);
    sourceCtx.putImageData(oImageData, 0, 0);
    for (let i = 0; i < aBinArray.length; i++) {
        for (let j = 0; j < aBinArray[0].length; j++) {
            binDataSet.push(aBinArray[i][j]);
            sPixelMatrix += numberDecoratorSave(aBinArray[i][j]);
        }
    }
    return [sPixelMatrix, binDataSet];
}
;

const writeBinarizedMatrix2 = (canvasWorker,iThreshold)=>{
    let iThresholdCopy = iThreshold;
    if (!iThresholdCopy) {
        let aHalftoneMatrix = canvasWorker.getHalftoneMatrix()
          , iPixelsSum = 0
          , iPixelsNumber = aHalftoneMatrix.length * aHalftoneMatrix.length;
        aHalftoneMatrix.forEach(aRow=>{
            aRow.forEach(iPixel=>{
                iPixelsSum += iPixel;
            }
            );
        }
        );
        iThresholdCopy = iPixelsSum / iPixelsNumber;
        binarizeThresholdInput.value = Math.round(iThresholdCopy);
        iThresholdCopy = 255 - iThresholdCopy;
        binarizeThresholdInputLabel.innerHTML = "Choose Threshold: " + Math.round(iThresholdCopy);
    }
    if (binarizedCanvas.width !== colorImage.width) {
        binarizedCanvas.width = colorImage.width;
        binarizedCanvas.height = colorImage.height;
    }
    const binDataSet = [];
    let sPixelMatrix = '';
    let[oImageData,aBinArray] = canvasWorker.binarizeImage(iThresholdCopy);
    binarizedCtx.putImageData(oImageData, 0, 0);
    for (let i = 0; i < aBinArray.length; i++) {
        for (let j = 0; j < aBinArray[0].length; j++) {
            binDataSet.push(aBinArray[i][j]);
            sPixelMatrix += numberDecoratorSave(aBinArray[i][j]);
        }
    }
    return [sPixelMatrix, binDataSet];
}
;

const writePixelMatrix = (canvasWorker)=>{
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
}
;

const writePixelMatrixNew = (canvasWorker)=>{
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
}
;

const writePixelMatrixNew2 = (canvasWorker)=>{
    const rastushevkaDataSet = [];
    let sPixelMatrix = '';
    let aShadedImageAndData = canvasWorker.shadeImage();
    finishCanvas.width = colorImage.width;
    finishCanvas.height = colorImage.height;
    finishCanvas.getContext('2d').putImageData(aShadedImageAndData[1], 0, 0);
    for (let i = 0; i < aShadedImageAndData[0].length; i++) {
        for (let j = 0; j < aShadedImageAndData[0][0].length; j++) {
            rastushevkaDataSet.push(Math.round(aShadedImageAndData[0][i][j]));
            sPixelMatrix += numberDecoratorNew(aShadedImageAndData[0][i][j]);
        }
    }
    return [sPixelMatrix, rastushevkaDataSet];
}
;

const writePixelMatrixDistance = (canvasWorker)=>{
    let sPixelMatrix = '';
    let aDistanceArray = canvasWorker.shadeImage();
    for (let i = 0; i < aDistanceArray[2].length; i++) {
        for (let j = 0; j < aDistanceArray[2][0].length; j++) {
            sPixelMatrix += numberDecorator(aDistanceArray[2][i][j]);
        }
    }
    return sPixelMatrix;
}
;

const writePixelMatrixDistance2 = (canvasWorker)=>{
    let sPixelMatrix = '';
    let aDistanceArray = canvasWorker.shadeImage();
    for (let i = 0; i < aDistanceArray[2].length; i++) {
        for (let j = 0; j < aDistanceArray[2][0].length; j++) {
            sPixelMatrix += numberDecorator(aDistanceArray[2][i][j]);
        }
    }
    return sPixelMatrix;
}
;

const isBlackPixel = (pixel)=>[0, 0, 0, 255].equals(pixel);

const isWhitePixel = (pixel)=>[255, 255, 255, 255].equals(pixel);
