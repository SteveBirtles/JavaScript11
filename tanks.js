const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 2000;

let w = 0, h = 0;
const pressedKeys = {};
let lastTimestamp = 0;
const mousePosition = {x: 0, y: 0};
let leftMouseClicked = false, rightMouseClicked = false;
let cursorInGround = false;
let cursorRadius = 100;
let cursorAngle = -Math.PI/4;
let cursorVelocity = 1000;

const foregroundTexture = new Image();
const backgroundTexture = new Image();
const maskCanvas = new OffscreenCanvas(WORLD_WIDTH, WORLD_HEIGHT);

let cameraX = 0, cameraY = 0;
let projectiles = [];
let gravity = 1000;

function testMask(x, y) {
    const maskContext = maskCanvas.getContext('2d');
    const cursorImage = maskContext.getImageData(x, y, 1, 1);
    return cursorImage.data[0] > 0;
}

class Projectile {
    constructor(x, y, dx, dy, r, invert) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.r = r;
        this.invert = invert;
        this.exploding = 0;
        this.expired = false;
    }
    update(frameLength) {
        if (this.exploding > 0) {
            this.exploding += frameLength*2;
            if (this.exploding > 1) this.expired = true;
        } else {
            this.dy += gravity * frameLength;
            this.x += this.dx * frameLength;
            this.y += this.dy * frameLength;
            if (testMask(this.x, this.y)) {
                this.exploding = 0.00001;
                const maskContext = maskCanvas.getContext('2d');
                maskContext.fillStyle = 'white';
                if (this.invert) {
                    maskContext.globalCompositeOperation = "source-over";
                } else {
                    maskContext.globalCompositeOperation = "destination-out";
                }
                maskContext.beginPath();
                maskContext.arc(this.x, this.y, this.r, 0, 2*Math.PI);
                maskContext.fill();
            }
        }
    }
    draw(context) {
        context.globalCompositeOperation = "lighter";
        if (this.exploding) {
            let r = this.invert ? 0 : 255 * (1 - this.exploding);
            let g = 128 * (1 - this.exploding);
            context.fillStyle = `rgb(${r}, ${g}, 0)`;
            context.beginPath();
            context.arc(this.x - cameraX, this.y - cameraY, this.r, 0, 2*Math.PI);
            context.fill();
            if (!this.invert) {
                context.beginPath();
                context.arc(this.x - cameraX, this.y - cameraY, this.r * (1 + this.exploding), 0, 2*Math.PI);
                context.fill();
            }
        } else {
            context.fillStyle = 'orange';
            context.beginPath();
            context.arc(this.x - cameraX, this.y - cameraY, 10, 0, 2*Math.PI);
            context.fill();
        }
    }
}

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

    window.addEventListener("resize", fixSize);
    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    const maskContext = maskCanvas.getContext('2d');
    maskContext.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    maskContext.fillStyle = 'white';
    maskContext.fillRect(0, WORLD_HEIGHT/2, WORLD_WIDTH, WORLD_HEIGHT);

    const canvas = document.getElementById('tanksCanvas');
    canvas.addEventListener('mousemove', event => {
      mousePosition.x = event.clientX + cameraX;
      mousePosition.y = event.clientY + cameraY;
      cursorInGround = testMask(mousePosition.x, mousePosition.y);
    });

    canvas.addEventListener('click', event => {
        leftMouseClicked = true;
    }, false);

    canvas.addEventListener('contextmenu', event => {
      rightMouseClicked = true;
      event.preventDefault();
    }, false);

    canvas.addEventListener('wheel', event => {
        cursorRadius -= event.deltaY / 10;
        if (cursorRadius < 10) cursorRadius = 10;
    }, false);

    foregroundTexture.src = "ground.jpg";
    foregroundTexture.onload = () => {
        backgroundTexture.src = "sky.jpg";
        backgroundTexture.onload = () => {
            window.requestAnimationFrame(gameFrame);
        };
    };


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

  if (leftMouseClicked || rightMouseClicked) {

      projectiles.push(new Projectile(mousePosition.x, mousePosition.y,
                                      cursorVelocity * Math.sin(cursorAngle), -cursorVelocity * Math.cos(cursorAngle),
                                      cursorRadius, rightMouseClicked));

    leftMouseClicked = false;
    rightMouseClicked = false;

  }

  let lastCameraX = cameraX;
  let lastCameraY = cameraY;

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

  if (pressedKeys["s"]) {
      cursorVelocity -= 500*frameLength;
      if (cursorVelocity < 100) cursorVelocity = 100;
  }

  if (pressedKeys["w"]) {
      cursorVelocity += 500*frameLength;
      if (cursorVelocity > 2000) cursorVelocity = 2000;
  }

  if (pressedKeys["a"]) {
      cursorAngle -= frameLength;
      if (cursorAngle < -Math.PI) cursorAngle = -Math.PI;
  }

  if (pressedKeys["d"]) {
      cursorAngle += frameLength;
      if (cursorAngle > Math.PI) cursorAngle = Math.PI;
  }

  mousePosition.x += cameraX - lastCameraX;
  mousePosition.y += cameraY - lastCameraY;
  cursorInGround = testMask(mousePosition.x, mousePosition.y);

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
  let foregroundX0 = -cameraX % foregroundTexture.width;
  let foregroundY0 = -cameraY % foregroundTexture.height;
  for (let i = foregroundX0; i < w; i += foregroundTexture.width) {
      for (let j = foregroundY0; j < h; j += foregroundTexture.height) {
          context.drawImage(foregroundTexture, i, j);
      }
  }

  context.globalCompositeOperation="destination-over";
  let backgroundX0 = -cameraX % backgroundTexture.width;
  let backgroundY0 = -cameraY % backgroundTexture.height;
  for (let i = backgroundX0; i < w; i += backgroundTexture.width) {
     for (let j = backgroundY0; j < h; j += backgroundTexture.height) {
         context.drawImage(backgroundTexture, i, j);
     }
 }

 for (let projectile of projectiles) {
     projectile.draw(context);
 }


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

 context.lineWidth = 4;

 if (cursorInGround) {
     context.strokeStyle = 'red';
 } else {
     context.strokeStyle = 'navy';
 }

 context.beginPath();
 context.moveTo(mousePosition.x - cameraX, mousePosition.y - cameraY - 50);
 context.lineTo(mousePosition.x - cameraX, mousePosition.y - cameraY + 50);
 context.stroke();

 context.beginPath();
 context.moveTo(mousePosition.x - cameraX - 50, mousePosition.y - cameraY);
 context.lineTo(mousePosition.x - cameraX + 50, mousePosition.y - cameraY);
 context.stroke();

 if (cursorInGround) {
     context.beginPath();
     context.arc(mousePosition.x - cameraX, mousePosition.y - cameraY, cursorRadius, 0, 2*Math.PI);
     context.stroke();
 } else {
     context.beginPath();
     context.moveTo(mousePosition.x - cameraX, mousePosition.y - cameraY);
     context.lineTo(mousePosition.x - cameraX + (cursorVelocity/4)*Math.sin(cursorAngle), mousePosition.y - cameraY - (cursorVelocity/4)*Math.cos(cursorAngle));
     context.stroke();
 }


}
