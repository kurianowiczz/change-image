var sourceCtx = document.getElementsByClassName('source-img')[0].getContext('2d'),
    finishCtx = document.getElementsByClassName('finish-img')[0].getContext('2d'),
    image = document.getElementsByClassName('img')[0],
    fileInput = document.getElementsByClassName('file')[0],
    uploadBtn = document.getElementsByClassName('upload')[0];
    // sourceImageData = sourceCtx.createImageData()

image.addEventListener('load', () => {
    sourceCtx.drawImage(image ,100, 100);

});

fileInput.addEventListener('change', () => {
   image.src = window.URL.createObjectURL(fileInput.files[0]);
   console.log(image.src);
});


