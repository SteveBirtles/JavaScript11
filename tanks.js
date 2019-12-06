const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;

let w = 0, h = 0;
const pressedKeys = {};
let lastTimestamp = 0;
const mousePosition = {x: 0, y: 0};
let leftMouseClicked = false, rightMouseClicked = false;

const foregroundTexture = new Image();
const backgroundTexture = new Image();
const maskCanvas = new OffscreenCanvas(WORLD_WIDTH, WORLD_HEIGHT);

function pageLoad() {

    fixSize();

    window.addEventListener("resize", fixSize);
    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    const maskContext = maskCanvas.getContext('2d');
    maskContext.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    maskContext.fillStyle = 'white';
    maskContext.fillRect(0, WORLD_HEIGHT/2, WORLD_WIDTH, WORLD_HEIGHT);

    const canvas = document.getElementById('tanksCanvas');
    canvas.addEventListener('mousemove', event => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;
    });

    canvas.addEventListener('click', event => {
        leftMouseClicked = true;
    }, false);

    canvas.addEventListener('contextmenu', event => {
      rightMouseClicked = true;
      event.preventDefault();
    }, false);

    foregroundTexture.src = "ground.jpg";
    foregroundTexture.onload = () => {
        backgroundTexture.src = "sky.jpg";
        backgroundTexture.onload = () => {
            window.requestAnimationFrame(gameFrame);
        };
    };


}

function fixSize() {

    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('tanksCanvas');
    canvas.width = w;
    canvas.height = h;

}


function gameFrame(timestamp) {

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const frameLength = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    inputs();
    processes(frameLength);
    outputs();

    window.requestAnimationFrame(gameFrame);

}

function inputs() {

  if (leftMouseClicked || rightMouseClicked) {

    const maskContext = maskCanvas.getContext('2d');

    maskContext.fillStyle = 'white';

    if (rightMouseClicked) {
      maskContext.globalCompositeOperation="destination-out";
    } else {
      maskContext.globalCompositeOperation="source-over";
    }
    maskContext.beginPath();
    maskContext.arc(mousePosition.x, mousePosition.y, 100, 0, 2*Math.PI);
    maskContext.fill();

    leftMouseClicked = false;
    rightMouseClicked = false;

  }

}


function processes(frameLength) {



}

let glide1 = 0;
let glide2 = 0;

function outputs() {

  const canvas = document.getElementById('tanksCanvas');
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, w, h);

  context.globalCompositeOperation="copy";
  context.drawImage(maskCanvas, 0,0);

  glide1 = (glide1 + 1) % foregroundTexture.width;
  glide2--; if (glide2 < 0) glide2 = backgroundTexture.width;

  context.globalCompositeOperation="source-atop";
  for (let i = -glide1; i < w; i += foregroundTexture.width) {
      for (let j = -glide1; j < h; j += foregroundTexture.height) {
          context.drawImage(foregroundTexture, i, j);
      }
  }

  context.globalCompositeOperation="destination-over";
  for (let i = -glide2; i < w; i += backgroundTexture.width) {
     for (let j = -glide2; j < h; j += backgroundTexture.height) {
         context.drawImage(backgroundTexture, i, j);
     }
 }

}
