let w = 0, h = 0;
let lastTimestamp = 0;

let pressedKeys = {};
let mousePosition = {x: 0, y: 0};

let launchRadius = 50;
let launchAngle = -Math.PI/4;
let launchVelocity = 750;

let cameraX = 0, cameraY = 0;

const foregroundTexture = new Image();
const backgroundTexture = new Image();


function fixSize() {

    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('tanksCanvas');
    canvas.width = w;
    canvas.height = h;

}


function pageLoad() {

    fixSize();
    cameraX = (WORLD_WIDTH - w) / 2;
    cameraY = (WORLD_HEIGHT - h) / 2;

    prepareListeners();
    prepareMask();

    foregroundTexture.src = "ground.jpg";
    foregroundTexture.onload = () => {
        backgroundTexture.src = "sky.jpg";
        backgroundTexture.onload = () => {
            window.requestAnimationFrame(gameFrame);
        };
    };
}


function prepareListeners() {

    window.addEventListener("resize", fixSize);

    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    const canvas = document.getElementById('tanksCanvas');

    canvas.addEventListener('mousemove', event => {
      mousePosition.x = event.clientX + cameraX;
      mousePosition.y = event.clientY + cameraY;
    });

    /* Other listeners (e.g. mouse clicks) go here. */

}


function gameFrame(timestamp) {

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const frameLength = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    inputs(frameLength);
    processes(frameLength);
    outputs();

    window.requestAnimationFrame(gameFrame);

}


function inputs(frameLength) {

    let lastCameraX = cameraX;
    let lastCameraY = cameraY;

    /* Map moving controls go here */
    if (pressedKeys["ArrowUp"]) {
        cameraY -= 500*frameLength;
        if (cameraY < 0) cameraY = 0;
    }

    if (pressedKeys["ArrowDown"]) {
        cameraY += 500*frameLength;
        if (cameraY > WORLD_HEIGHT - h) cameraY = WORLD_HEIGHT - h;
    }

    if (pressedKeys["ArrowLeft"]) {
        cameraX -= 500*frameLength;
        if (cameraX < 0) cameraX = 0;
    }

    if (pressedKeys["ArrowRight"]) {
        cameraX += 500*frameLength;
        if (cameraX > WORLD_WIDTH - w) cameraX = WORLD_WIDTH - w;
    }

    mousePosition.x += cameraX - lastCameraX;
    mousePosition.y += cameraY - lastCameraY;


    /* Launch angle, etc., controls go here */

}


function processes(frameLength) {

    for (let projectile of projectiles) {
        projectile.update(frameLength);
    }

    projectiles = projectiles.filter(p => !p.expired);

}


function outputs() {

  const canvas = document.getElementById('tanksCanvas');
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, w, h);

  context.globalCompositeOperation="copy";
  context.drawImage(maskCanvas, cameraX, cameraY, w, h, 0, 0, w, h);

  context.globalCompositeOperation="source-atop";
  let x0 = -cameraX % foregroundTexture.width;
  let y0 = -cameraY % foregroundTexture.height;
  for (let i = x0; i < w; i += foregroundTexture.width) {
      for (let j = y0; j < h; j += foregroundTexture.height) {
          context.drawImage(foregroundTexture, i, j);
      }
  }

  context.globalCompositeOperation="destination-over";
  for (let i = 0; i < w; i += backgroundTexture.width) {
     for (let j = 0; j < h; j += backgroundTexture.height) {
         context.drawImage(backgroundTexture, i, j);
     }
 }


  for (let projectile of projectiles) {
     projectile.draw(context);
  }

  drawMiniMap(context)

  /* Launch cursor code goes here */

  context.fillStyle = 'limegreen';
  context.beginPath();
  let x = mousePosition.x - cameraX;
  let y = mousePosition.y - cameraY;
  context.arc(x, y, 50, 0, 2*Math.PI);
  context.fill();



}
