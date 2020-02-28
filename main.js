let sourceCanvas = document.getElementsByClassName('source-img')[0],
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
    let canvasWorker = new CanvasWorker(sourceCanvas);
	imageMatrixSpan.innerText = writePixelMatrix(canvasWorker);
});

fileInput.addEventListener('change', () => {
   image.src = window.URL.createObjectURL(fileInput.files[0]);
});

function writePixelMatrix( canvasWorker ) {
	let sPixelMatrix = '';

	for (let i = 0; i < canvasWorker.getWidth(); i++) {
		for (let j = 0; j < canvasWorker.getHeight(); j++) {
			console.log(canvasWorker.getPixel(i, j));
			let pixel = canvasWorker.getPixel(i, j);
			if ( isBlackPixel(pixel) ) {
				sPixelMatrix += '1\t' + \u0020;
			} else if( isWhitePixel(pixel) ) {
				sPixelMatrix += '0\t';
			}
		}
		sPixelMatrix += '\n';
	}
	console.log(sPixelMatrix);
	return sPixelMatrix;
}

function isBlackPixel(pixel) {
	return pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 255;
}

function isWhitePixel(pixel) {
	return pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 255 && pixel[3] === 255;
}



