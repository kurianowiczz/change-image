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
    downloadsCanvas = document.createElement('canvas');
downloadsCanvas.className = 'Save-new';
saveBtnNew.addEventListener('click', () => {
    const doc = document.getElementsByClassName('pixel-edit');
    let canvasWorker = new CanvasWorker(downloadsCanvas);
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
    downloadsCanvas.width = sourceCanvas.width;
    downloadsCanvas.height = sourceCanvas.height;
    console.log(canvasWorker.getImageDataFromMatrix(arr))
    downloadsCanvas.getContext('2d').putImageData(canvasWorker.getImageDataFromMatrix(arr),0,0);
    const link = document.createElement('a');
    link.setAttribute('download', 'resultImg.bmp');
    link.setAttribute('href', downloadsCanvas.toDataURL("image/bmp").replace("image/bmp",
        "image/octet-stream"));
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

});



