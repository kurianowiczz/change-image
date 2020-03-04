// Works on arrays of primitives
function equals(arr) {
	return this.every((el, index) => el === arr[index]);
}

Array.prototype.equals = equals;

const sourceCanvas = document.getElementsByClassName('source-img')[0],
	finishCanvas = document.getElementsByClassName('finish-img')[0],
	sourceCtx = sourceCanvas.getContext('2d'),
    finishCtx = finishCanvas.getContext('2d'),
    image = new Image(),
    fileInput = document.getElementsByClassName('file')[0],
    uploadBtn = document.getElementsByClassName('upload')[0],
	imageMatrixSpan = document.getElementsByClassName('imageMatrix')[0];

image.addEventListener('load', () => {
	sourceCanvas.width = image.width;
	sourceCanvas.height = image.height;
    sourceCtx.drawImage(image, 0, 0);
	const canvasWorker = new CanvasWorker(sourceCanvas);
	const matrix = writePixelMatrix(canvasWorker)
	imageMatrixSpan.innerHTML = matrix;
	imageMatrixSpan.setAttribute('style', `
	display: grid;
	grid-template-columns: repeat(${canvasWorker.getWidth()}, max-content);
	grid-gap: 3px 3px;
	`)
});

fileInput.addEventListener('change', () => {
   image.src = window.URL.createObjectURL(fileInput.files[0]);
});

const numberDecorator = (num) => `
<div style="
	padding: 4px 10px;
	background-color: ${num ? 'black': '#fafafa'};
	color: ${num ? 'white' : 'black'};
	border-radius: 3px;
	">
	${num}
</div>
`;

const writePixelMatrix = (canvasWorker) => {
	let sPixelMatrix = '';

	for (let i = 0; i < canvasWorker.getWidth(); i++) {
		for (let j = 0; j < canvasWorker.getHeight(); j++) {
			let pixel = canvasWorker.getPixel(i, j);
			if ( isBlackPixel(pixel) ) {
				sPixelMatrix += numberDecorator(1);
			} else if( isWhitePixel(pixel) ) {
				sPixelMatrix += numberDecorator(0);
			}
		}
	}
	return sPixelMatrix;
}

const isBlackPixel = (pixel) => [0, 0, 0, 255].equals(pixel);

const isWhitePixel = (pixel) => [255, 255, 255, 255].equals(pixel);



