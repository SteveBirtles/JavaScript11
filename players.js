let players = [];
let playerTurn = 0;

let playerImages = [];
let playerImageFilenames = ['red.png', 'green.png', 'blue.png', 'orange.png', 'cyan.png', 'magenta.png'];

let loadPlayerImages = new Promise(function(resolve) {

    let loadedImageCount = 0;

    let loadCheck = function() {
        loadedImageCount++;
        if (loadedImageCount === playerImageFilenames.length) {
            resolve();
        }
    }

    for (let f of playerImageFilenames) {
        let img = new Image();
        img.src = f;
        img.onload = () => loadCheck();
        playerImages.push(img);
    }

});

class Player {

    constructor(id, x, y, imageNo) {

        this.id = id;

        this.x = x;
        this.y = y;
        this.imageNo = imageNo;

        this.launchRadius = 50;
        this.launchAngle = -Math.PI/4;
        this.launchVelocity = 750;

        this.alive = true;
        this.health = 100;
        this.dx = 0;
        this.dy = 0;

    }

    draw(context) {
        if (!this.alive) return;
        context.globalCompositeOperation="source-over";
        context.save();
        context.translate(this.x - playerImages[this.imageNo].width/2 - cameraX,
                            this.y - playerImages[this.imageNo].height/2 - cameraY);

        let facingRight = this.x < WORLD_WIDTH/2; // THIS LINE IS TEMPORARY

        if (facingRight) {
            context.scale(-1, 1);
            context.drawImage(playerImages[this.imageNo], -playerImages[this.imageNo].width, 0);
        } else {
            context.drawImage(playerImages[this.imageNo], 0, 0);
        }
        context.restore();

        if (playerTurn === this.id) {

            context.lineWidth = 4;
            context.strokeStyle = 'red';

            context.beginPath();
            context.moveTo(this.x - cameraX, this.y - cameraY - 50);
            context.lineTo(this.x - cameraX, this.y - cameraY + 50);
            context.stroke();

            context.beginPath();
            context.moveTo(this.x - cameraX - 50, this.y - cameraY);
            context.lineTo(this.x - cameraX + 50, this.y - cameraY);
            context.stroke();

            context.beginPath();
            context.arc(this.x - cameraX, this.y - cameraY, this.launchRadius, 0, 2*Math.PI);
            context.stroke();

            context.beginPath();
            context.moveTo(this.x - cameraX, this.y - cameraY);
            context.lineTo(this.x - cameraX + (this.launchVelocity/4)*Math.sin(this.launchAngle),
                           this.y - cameraY - (this.launchVelocity/4)*Math.cos(this.launchAngle));
            context.stroke();

      }

    }

    update(frameLength) {

        if (!player.alive) return;

        this.x += frameLength * this.dx;
        this.y += frameLength * this.dy;

    }
}
