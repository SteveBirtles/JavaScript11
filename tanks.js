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

    /* Map moving controls go here */

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

  /* Texture mapping code goes here */

  for (let projectile of projectiles) {
     projectile.draw(context);
  }

  drawMiniMap(context)

  /* Launch cursor code goes here */

}
