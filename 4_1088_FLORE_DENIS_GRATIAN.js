const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageUpload = document.getElementById("imageUpload");

let image = new Image();
let isSelecting = false;

let selection = {
  x: 0, y: 0, w: 0, h: 0
};

let currentImage;

let initialMouseX = 0;
let initialMouseY = 0;

function deseneazaImagineaInCanvas(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        image.src = e.target.result;
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            currentImage = image;
        };
    };

    reader.readAsDataURL(file);
}

imageUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        deseneazaImagineaInCanvas(file);
    }
});

function dropHandler(event) {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        deseneazaImagineaInCanvas(file);
    }
}

function dragOverHandler(event) {
    event.preventDefault();
}

function moveSelection(event) {
    if (!isSelecting) return;

    const deltaX = event.clientX - canvas.getBoundingClientRect().left - initialMouseX;
    const deltaY = event.clientY - canvas.getBoundingClientRect().top - initialMouseY;

    console.log("DELTA X SI DELTA Y : "+ deltaX+" "+deltaY)

    selection.x += deltaX;
    selection.y += deltaY;

    initialMouseX = event.clientX - canvas.getBoundingClientRect().left;
    initialMouseY = event.clientY - canvas.getBoundingClientRect().top;

    drawSelection();
}

function endMoveSelection() {
    isSelecting = false;

    canvas.removeEventListener('mousemove', moveSelection);
    canvas.removeEventListener('mouseup', endMoveSelection);
}

function startSelection(event) {
    if (event.shiftKey) {
        initialMouseX = event.clientX - canvas.getBoundingClientRect().left;
        initialMouseY = event.clientY - canvas.getBoundingClientRect().top;

        isSelecting = true;


        canvas.addEventListener('mousemove', moveSelection);
        canvas.addEventListener('mouseup', endMoveSelection);

    } else {
        isSelecting = true;
        selection.x = event.clientX - canvas.getBoundingClientRect().left;
        selection.y = event.clientY - canvas.getBoundingClientRect().top;

        canvas.addEventListener('mousemove', updateSelection);
        canvas.addEventListener('mouseup', endSelection);
    }
}

function updateSelection(event) {
    if (!isSelecting) return;
    selection.w = event.clientX - canvas.getBoundingClientRect().left - selection.x;
    selection.h = event.clientY - canvas.getBoundingClientRect().top - selection.y;
    drawSelection();
}

function endSelection() {
    isSelecting = false;

    canvas.removeEventListener('mousemove', updateSelection);
    canvas.removeEventListener('mouseup', endSelection);
}

function drawSelection() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1;
    ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
    ctx.drawImage(currentImage, selection.x, selection.y, selection.w, selection.h, selection.x, selection.y, selection.w, selection.h);
}

function cropImage() {
    if (selection.w !== 0 && selection.h !== 0) {
        const minX = Math.min(selection.x, selection.x + selection.w);
        const minY = Math.min(selection.y, selection.y + selection.h);
        const width = Math.abs(selection.w);
        const height = Math.abs(selection.h);

        const canvasTemp = document.createElement('canvas');
        const ctxCanvasTemp = canvasTemp.getContext('2d');
        canvasTemp.width = currentImage.width;
        canvasTemp.height = currentImage.height;

        ctxCanvasTemp.drawImage(currentImage, 0, 0);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(canvasTemp, minX, minY, width, height, 0, 0, width, height);

      

        currentImage = new Image();
        currentImage.src = canvas.toDataURL();
        currentImage.onload = function () {
            selection = { x: 0, y: 0, w: 0, h: 0 };
        };

    }
}

function scaleImage() {
    let newWidth = prompt("Introduceti noua latime (px):");
    let newHeight = prompt("Introduceti noua inaltime (px):");

    if (newWidth && newHeight) {
        newWidth = parseInt(newWidth);
        newHeight = parseInt(newHeight);

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        tempCtx.drawImage(currentImage, 0, 0, newWidth, newHeight);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);

        currentImage = new Image();
        currentImage.src = canvas.toDataURL();
        currentImage.onload = function () {
            selection = { x: 0, y: 0, w: 0, h: 0 };
        };
    }
}

function adaugareText() {
    let text = prompt("Introduceti textul:");
    let fontSize = prompt("Introduceti dimensiunea textului (px):");
    let culoare = prompt("Introduceti culoarea textului (DE FORMA : #FFFFFF):");
    let pozitiaX = prompt("Introduceti pozitia pe axa X (px):");
    let pozitiaY = prompt("Introduceti pozitia pe axa Y (px):");

    if (text && fontSize && culoare && pozitiaX && pozitiaY) {
      fontSize = parseInt(fontSize);
      pozitiaX = parseInt(pozitiaX);
      pozitiaY = parseInt(pozitiaY);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImage, 0, 0);

        ctx.font= `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(text, pozitiaX, pozitiaY);
    }
}

function stergerePixeliDinSelectie() {
    if (selection.w !== 0 && selection.h !== 0) {
        const canvasTemporar = document.createElement('canvas');
        const ctxTemporar = canvasTemporar.getContext('2d');
        canvasTemporar.width = currentImage.width;
        canvasTemporar.height = currentImage.height;

        ctxTemporar.drawImage(currentImage, 0, 0);

        ctxTemporar.fillStyle = 'white';
        ctxTemporar.fillRect(selection.x, selection.y, selection.w, selection.h);

        currentImage = new Image();
        currentImage.src = canvasTemporar.toDataURL();
        currentImage.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentImage, 0, 0);
            selection = { x: 0, y: 0, w: 0, h: 0 };
        };
    }
}

function aplicaFiltruUtilizator(tipFiltru) {
    let procentulDorit = prompt(`Introduceti procentul dorita pentru ${tipFiltru}:`);
    if (procentulDorit !== null && procentulDorit !== "") {
        let valoareFiltru = `${tipFiltru}(${procentulDorit})`;
        aplicaFiltrul(valoareFiltru);
    }
}

function aplicaFiltrul(valoareFiltru) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);

    if (selection.w !== 0 && selection.h !== 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(selection.x, selection.y, selection.w, selection.h);
        ctx.closePath();
        ctx.clip();
        ctx.filter = valoareFiltru;
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        currentImage = new Image();
        currentImage.src = canvas.toDataURL();
        currentImage.onload = function () {
            selection = { x: 0, y: 0, w: 0, h: 0 };
        };
    }
}

function deselectare() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);
}

function salveazaImaginea() {
    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL();
    downloadLink.download = 'imageNoua.png';
    downloadLink.click();
}

