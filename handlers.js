const saveBtn = document.getElementsByClassName('saveBtn')[0],
    finishCanvasImg = document.getElementsByClassName('finish-img')[0];
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.setAttribute('download', 'resultImg.bmp');
    link.setAttribute('href', finishCanvasImg.toDataURL("image/bmp").replace("image/bmp",
        "image/octet-stream"));
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

const saveBtnNew = document.getElementsByClassName('saveBtnNew')[0],
    downloadsCanvas = document.getElementsByClassName('source-img')[0];
downloadsCanvas.className = 'Save-new';
saveBtnNew.addEventListener('click', () => {
    const link = document.createElement('a');
    link.setAttribute('download', 'resultImg.bmp');
    link.setAttribute('href', downloadsCanvas.toDataURL("image/bmp").replace("image/bmp",
        "image/octet-stream"));
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

});

const shadeImageBtn = document.getElementsByClassName('shadeImage')[0];
shadeImageBtn.addEventListener('click', () => {
    const canvasWorker = new CanvasWorker(sourceCanvas);
    shadeImage(canvasWorker);
});

binarizeThresholdInput.addEventListener('input', () => {
    binarizeThresholdInputLabel.innerHTML = "Choose Threshold: " + binarizeThresholdInput.value;
});

binarizeThresholdInput.addEventListener('change', () => {
    const canvasWorker = new CanvasWorker(finishCanvas);
    binarizeImage(canvasWorker, binarizeThresholdInput.value);
})

let binarizeImageBtn = document.getElementsByClassName('binarizeImage')[0];
binarizeImageBtn.addEventListener('click', () => {
    const canvasWorker = new CanvasWorker(finishCanvas);
    binarizeImage(canvasWorker); 
});


