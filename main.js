// Works on arrays of primitives
function equals(arr) {
	return this.every((el, index) => el === arr[index]);
}

Array.prototype.equals = equals;

const sourceCanvas = document.getElementsByClassName('source-img')[0],
	finishCanvas = document.getElementsByClassName('finish-img')[0],
	sourceCtx = sourceCanvas.getContext('2d'),
    image = new Image(),
    fileInput = document.getElementsByClassName('file')[0],
	imageMatrixSpan = document.getElementsByClassName('imageMatrix')[0],
	imageMatrixSpanNew = document.getElementsByClassName('imageMatrixNew')[0],
	imageMatrixSpanDistance = document.getElementsByClassName('imageMatrixNewDistance')[0];

image.addEventListener('load', () => {
	sourceCanvas.width = image.width;
	sourceCanvas.height = image.height;
    sourceCtx.drawImage(image, 0, 0);
	const canvasWorker = new CanvasWorker(sourceCanvas);
	const matrix = writePixelMatrix(canvasWorker);
	const newMatrix = writePixelMatrixNew(canvasWorker);
	const newMatrixDistance = writePixelMatrixDistance(canvasWorker);
	imageMatrixSpan.innerHTML = matrix;
	imageMatrixSpanNew.innerHTML = newMatrix;
	const doc = document.getElementsByClassName('pixel-edit');
	let isChanged = false
	changePixel = oEvent => {
		if(!isChanged && oEvent.buttons == 1) {
			oEvent.target.innerHTML = '1'
			oEvent.target.style.backgroundColor = 'black'
			oEvent.target.style.color = 'white'
			isChanged = true;
		}
		if(!isChanged && oEvent.buttons == 2) {
			oEvent.target.innerHTML = '0';
			oEvent.target.style.backgroundColor = '#fafafa';
			oEvent.target.style.color = 'black';
			isChanged = true;
		}
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
	imageMatrixSpanDistance.innerHTML = newMatrixDistance;
	imageMatrixSpan.setAttribute('style', `
	display: grid;
	grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
	grid-gap: 3px 3px;
	`);
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
});

fileInput.addEventListener('change', () => {
   image.src = window.URL.createObjectURL(fileInput.files[0]);
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

const writePixelMatrix = (canvasWorker) => {
	let sPixelMatrix = '';
	let aBinArray = canvasWorker.getBinArray();
	for (let i = 0; i < aBinArray.length; i++) {
		for (let j = 0; j < aBinArray[0].length; j++) {
			sPixelMatrix += numberDecoratorSave(aBinArray[i][j]);
		}
	}
	return sPixelMatrix;
};

const writePixelMatrixNew = (canvasWorker) => {
	let sPixelMatrix = '';
	let aShadedImageAndData = canvasWorker.shadeImage();
	finishCanvas.width = image.width;
	finishCanvas.height = image.height;
	finishCanvas.getContext('2d').putImageData(aShadedImageAndData[1], 0, 0);
	for (let i = 0; i < aShadedImageAndData[0].length; i++) {
		for (let j = 0; j < aShadedImageAndData[0][0].length; j++) {
			sPixelMatrix += numberDecoratorNew(aShadedImageAndData[0][i][j]);
		}
	}
	return sPixelMatrix;
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




