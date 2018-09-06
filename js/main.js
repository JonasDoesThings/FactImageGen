var textObj;

window.onload = function () {
    const canvas = document.getElementById("canv");
    const context = canvas.getContext("2d");

    redrawCanvas(canvas, context);

    $('input').on('input', function () {
        redrawCanvas(canvas, context);
    });
};

function redrawCanvas(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const width = $('#image-width').val();
    const height = $('#image-height').val();

    canvas.height = height;
    canvas.width = width;

    canvas.style.letterSpacing = $('#text-offset').val() + "px";

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    //We need to wait for the Background to finish, since it's loaded async
    drawBG(canvas, context, function () {
        drawLogo(canvas, context);
        drawWatermark(canvas, context);
        drawText(canvas, context);
    });


}

function drawText(canvas, context) {
    context.fillStyle = $('#text-color').val();
    context.font = "bold " + $('#text-size').val() + "pt sans-serif";

    context.strokeStyle = $('#text-outline-color').val();
    context.lineWidth = $('#text-outline-size').val();

    let lines = getLines(context, $('#text').val(), $('#text-maxlength').val());
    var yCounter = canvas.height / 2 - ((lines.length-1) * ($('#text-lineheight').val() / 2));
    lines.forEach(function (line) {
        context.fillText(line, canvas.width/2, yCounter);
        context.strokeText(line, canvas.width/2, yCounter);
        yCounter += parseInt($('#text-lineheight').val());
    });

}

function drawLogo(canvas, context) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.onload = function () {
            let scaledWidth = img.width*$('#logo-scale').val()/100, scaledHeight = img.height*$('#logo-scale').val()/100;

            context.drawImage(img, $('#logo-position-x').val(), $('#logo-position-y').val(),
                scaledWidth, scaledHeight);
        };

        img.src = event.target.result;
    };

    if (!document.getElementById('logo-image').files[0]) {
        fetch("img/defaultlogo.png").then(res => res.blob().then(blob => reader.readAsDataURL(blob)));
    } else {
        reader.readAsDataURL(document.getElementById('logo-image').files[0]);
    }
}

function drawWatermark(canvas, context) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.onload = function () {
            let scaledWidth = img.width*$('#watermark-scale').val()/100, scaledHeight = img.height*$('#watermark-scale').val()/100;

            context.drawImage(img, (canvas.width - scaledWidth) / 2, canvas.height - scaledHeight - $('#watermark-margin-y').val(),
                scaledWidth, scaledHeight);
        };

        img.src = event.target.result;
    };

    if (!document.getElementById('watermark-image').files[0]) {
        fetch("img/defaultmark.png").then(res => res.blob().then(blob => reader.readAsDataURL(blob)));
    } else {
        reader.readAsDataURL(document.getElementById('watermark-image').files[0]);
    }
}

function drawBG(canvas, context, callback) {
    let reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.onload = function () {
            context.filter = "blur(" + $('#bg-blur').val() + "px)";
            drawImageProp(context, img, 0, 0, canvas.width, canvas.height);
            context.filter = "blur(0px)";
            callback();
        };

        img.src = event.target.result;
    };

    if (!document.getElementById('bg-image').files[0]) {
        fetch("img/defaultbg.png").then(res => res.blob().then(blob => reader.readAsDataURL(blob)));
    } else {
        reader.readAsDataURL(document.getElementById('bg-image').files[0]);
    }
}

function getLines(context, text, maxWidth) {
    let words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
 */
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}