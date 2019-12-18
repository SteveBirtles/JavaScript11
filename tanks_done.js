let w = 0, h = 0;
let lastTimestamp = 0;

let pressedKeys = {};
let mousePosition = {x: 0, y: 0};

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
            loadPlayerImages.then(() => {
                window.requestAnimationFrame(gameFrame);
            });
        };
    };

    players.push(new Player(0, WORLD_WIDTH/4, WORLD_HEIGHT/2 - playerImages[1].height/2, 1));
    players.push(new Player(1, 3*WORLD_WIDTH/4, WORLD_HEIGHT/2 - playerImages[2].height/2, 2));

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

    /*canvas.addEventListener('click', event => {

    }, false);*/

    /*canvas.addEventListener('contextmenu', event => {
        projectiles.push(new Projectile(mousePosition.x, mousePosition.y,
                                        players[playerTurn].launchVelocity * Math.sin(players[playerTurn].launchAngle), -players[playerTurn].launchVelocity * Math.cos(players[playerTurn].launchAngle),
                                        players[playerTurn].launchRadius, true));
      event.preventDefault();
    }, false);*/

    canvas.addEventListener('wheel', event => {
        players[playerTurn].launchRadius -= event.deltaY / 10;
        if (players[playerTurn].launchRadius < 10) players[playerTurn].launchRadius = 10;
    }, false);

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
      players[playerTurn].launchVelocity -= 500*frameLength;
      if (players[playerTurn].launchVelocity < 100) players[playerTurn].launchVelocity = 100;
  }

  if (pressedKeys["w"]) {
      players[playerTurn].launchVelocity += 500*frameLength;
      if (players[playerTurn].launchVelocity > 2000) players[playerTurn].launchVelocity = 2000;
  }

  if (pressedKeys["a"]) {
      players[playerTurn].launchAngle -= frameLength;
      if (players[playerTurn].launchAngle < -Math.PI) players[playerTurn].launchAngle = -Math.PI;
  }

  if (pressedKeys["d"]) {
      players[playerTurn].launchAngle += frameLength;
      if (players[playerTurn].launchAngle > Math.PI) players[playerTurn].launchAngle = Math.PI;
  }

  if (pressedKeys[" "]) {
    projectiles.push(new Projectile(players[playerTurn].x, players[playerTurn].y,
                                    players[playerTurn].launchVelocity * Math.sin(players[playerTurn].launchAngle), -players[playerTurn].launchVelocity * Math.cos(players[playerTurn].launchAngle),
                                    players[playerTurn].launchRadius, false));
  }

  mousePosition.x += cameraX - lastCameraX;
  mousePosition.y += cameraY - lastCameraY;

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

  for (let player of players) {
      player.draw(context);
  }

 drawMiniMap(context)

}
