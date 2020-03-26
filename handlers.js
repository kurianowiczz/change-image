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


