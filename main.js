var sourceCanvas = document.getElementsByClassName('source-img')[0];
	finishCanvas = document.getElementsByClassName('finish-img')[0];
	sourceCtx = sourceCanvas.getContext('2d'),
    finishCtx = finishCanvas.getContext('2d'),
    image = new Image(),
    fileInput = document.getElementsByClassName('file')[0],
    uploadBtn = document.getElementsByClassName('upload')[0];
    // sourceImageData = sourceCtx.createImageData()

image.addEventListener('load', () => {
	sourceCanvas.width = image.width;
	sourceCanvas.height = image.height;
    sourceCtx.drawImage(image, 0, 0);
    let canvasWorker = new CanvasWorker(sourceCanvas);
    /*for (let i = 0; i < 50; i ++){
    	for (let j = 0; j < 50; j++) {
    		canvasWorker.setPixel([255, 255, 255, 1], i, j);
    	}
    }
    canvasWorker.saveImageData();
    for (let i = 0; i < 50; i ++){
    	for (let j = 0; j < 50; j++) {
    		console.log(canvasWorker.getPixel(i, j));
    	}
    }*/
});

fileInput.addEventListener('change', () => {
   image.src = window.URL.createObjectURL(fileInput.files[0]);
});


