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
});

fileInput.addEventListener('change', () => {
   image.src = window.URL.createObjectURL(fileInput.files[0]);
});


