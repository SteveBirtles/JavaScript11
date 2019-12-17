const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 2000;

let cameraX = 0, cameraY = 0;

const maskCanvas = new OffscreenCanvas(WORLD_WIDTH, WORLD_HEIGHT);

function prepareMask() {

    const maskContext = maskCanvas.getContext('2d');
    maskContext.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    maskContext.fillStyle = 'white';
    maskContext.fillRect(0, WORLD_HEIGHT/2, WORLD_WIDTH, WORLD_HEIGHT);

}

function testMask(x, y) {

    const maskContext = maskCanvas.getContext('2d');
    const cursorImage = maskContext.getImageData(x, y, 1, 1);
    return cursorImage.data[0] > 0;

}

function drawMiniMap(context) {

    context.globalCompositeOperation="source-over";
    context.globalAlpha = 0.5;
    context.fillStyle = 'black';
    context.fillRect(50, 50, WORLD_WIDTH/10, WORLD_HEIGHT/10);
    context.drawImage(maskCanvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT, 50, 50, WORLD_WIDTH/10, WORLD_HEIGHT/10);

    context.globalAlpha = 1;
    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.strokeRect(50, 50, WORLD_WIDTH/10, WORLD_HEIGHT/10);
    context.strokeRect(50 + cameraX/10, 50 + cameraY/10, w/10, h/10);

    context.beginPath();
    context.moveTo(50 + mousePosition.x/10, 50 + mousePosition.y/10 - 5);
    context.lineTo(50 + mousePosition.x/10, 50 + mousePosition.y/10 + 5);
    context.stroke();

    context.beginPath();
    context.moveTo(50 + mousePosition.x/10 - 5, 50 + mousePosition.y/10);
    context.lineTo(50 + mousePosition.x/10 + 5, 50 + mousePosition.y/10);
    context.stroke();

}
