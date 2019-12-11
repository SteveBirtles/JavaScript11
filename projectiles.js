let projectiles = [];
let gravity = 1000;

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
            if (this.x < -10 || this.x > WORLD_WIDTH+10 || this.y > WORLD_HEIGHT+10) this.expired = true;
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
