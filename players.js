let playerImages = [];
let playerImageFilenames = ['red.png', 'green.png', 'blue.png', 'orange.png', 'cyan.png', 'magenta.png'];

let loadPlayerImages = new Promise(function(resolve) {

    let loadedImageCount = 0;

    let loadCheck = function() {
        loadedImageCount++;
        if (loadedImageCount === 6) {
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

let players = [];

class Player {

    constructor(x, y, imageNo, direction) {
        this.x = x;
        this.y = y;
        this.imageNo = imageNo;
        this.direction = direction;
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
        if (this.direction === -1) {
            context.scale(-1, 1);
            context.drawImage(playerImages[this.imageNo], -playerImages[this.imageNo].width, 0);
        } else {
            context.drawImage(playerImages[this.imageNo], 0, 0);
        }
        context.restore();
    }

    update(frameLength) {

        if (!player.alive) return;

        this.x += frameLength * this.dx;
        this.y += frameLength * this.dy;

    }
}
