/** @type {HTMLCanvasElement} */
export { FlyingEnemy, GroundEnemy, ClimbingEnemy };

class Enemy {
    constructor() {
        this.frameX = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
    };
    update(deltaTime) {
        this.x -= this.speedX + this.game.speed;
        this.y += this.speedY;
        if(this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else this.frameTimer += deltaTime;

        // check if enemy crossed the screen
        if(this.x + this.width < 0) {
            this.markedForDeletion = true;
            if(this.game.score > 0) this.game.score -= 1;  //Deducts score if enemy crosses the screen
        };
    };
    draw(context) {
        if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    };
};

class FlyingEnemy extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.randomVal = Math.random() * 3;
        this.width = 60;
        this.height = 44;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * this.game.height * 0.5;
        this.speedX = Math.random() + 3;
        this.speedY = 0;
        this.angle = 0;
        this.va = Math.random() * 0.2;
        this.curve = Math.random() * 3;
        
        if(this.randomVal <= 0.5) {
            this.spriteWidth = 60;
            this.spriteHeight = 44;
            this.image = document.getElementById('enemy_fly');
            this.maxFrame = 5;
        } else if(0.5 < this.randomVal && this.randomVal <= 1) {
            this.spriteWidth = 83.166;
            this.spriteHeight = 44;
            this.image = document.getElementById('enemy_bat_1');
            this.maxFrame = 5;
        } else if(1 < this.randomVal && this.randomVal <= 1.5) {
            this.spriteWidth = 238;
            this.spriteHeight = 167;
            this.image = document.getElementById('enemy_bat_2');
            this.maxFrame = 7;
        } else if(1.5 < this.randomVal && this.randomVal <= 2) {
            this.spriteWidth = 266;
            this.spriteHeight = 188;
            this.image = document.getElementById('enemy_bat_3');
            this.maxFrame = 5;
        } else if(2 < this.randomVal && this.randomVal <= 2.5) {
            this.spriteWidth = 218;
            this.spriteHeight = 177;
            this.image = document.getElementById('enemy_ghost_1');
            this.maxFrame = 5;
        } else {
            this.spriteWidth = 87.333;
            this.spriteHeight = 70;
            this.image = document.getElementById('enemy_ghost_3');
            this.maxFrame = 5;
        };
    };
    update(deltaTime) {
        super.update(deltaTime);
        this.y += (Math.random() > 0.5 ? Math.sin(this.angle) : Math.cos(this.angle));
        this.angle += this.va;
    };
};

class GroundEnemy extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.width = 110;
        this.height = 110;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.speedX = 0;
        this.speedY = 0;
        this.randomVal = Math.random() * 3;
        
        if(0.5 >= this.randomVal) {
            this.spriteWidth = 120.125;
            this.spriteHeight = 90;
            this.image = document.getElementById('enemy_ground_zombie');
            this.maxFrame = 7;
        } else if(0.5 < this.randomVal && this.randomVal <= 1) {
            this.spriteWidth = 55.75;
            this.spriteHeight = 80;
            this.image = document.getElementById('enemy_hand');
            this.maxFrame = 7;
        } else if(1 < this.randomVal && this.randomVal <= 1.5) {
            this.spriteWidth = 80.333;
            this.spriteHeight = 60;
            this.image = document.getElementById('enemy_worm');
            this.maxFrame = 5;
        } else if(1.5 < this.randomVal && this.randomVal <= 2) {
            this.spriteWidth = 292;
            this.spriteHeight = 410;
            this.image = document.getElementById('enemy_zombie');
            this.maxFrame = 7;
        } else if(2 < this.randomVal && this.randomVal <= 2.5){
            this.spriteWidth = 260;
            this.spriteHeight = 178;
            this.image = document.getElementById('enemy_digger');
            this.maxFrame = 7;
        } else {
            this.spriteWidth = 80;
            this.spriteHeight = 89;
            this.image = document.getElementById('enemy_ghost_2');
            this.maxFrame = 1;
        };
    };
};

class ClimbingEnemy extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.width = 115;
        this.height = 120;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height * 0.5;
        this.speedX = 0;
        this.speedY = Math.random() > 0.5 ? 1 : -1;
        this.randomVal = Math.random() * 1.5;
        
        if(0.5 >= this.randomVal) {
            this.spriteWidth = 310;
            this.spriteHeight = 175;
            this.image = document.getElementById('enemy_spider');
            this.maxFrame = 5;
        } else if(0.5 < this.randomVal && this.randomVal <= 1) {
            this.spriteWidth = 120;
            this.spriteHeight = 144;
            this.image = document.getElementById('enemy_spider_big');
            this.maxFrame = 5;
        } else {
            this.spriteWidth = 213;
            this.spriteHeight = 212;
            this.image = document.getElementById('enemy_spinner');
            this.maxFrame = 8;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        if(this.y > this.game.height - this.height - this.game.groundMargin) this.speedY *= -1;
        else if(this.y < 0) this.speedY *= -1;
        if(this.x + this.width < 0) this.markedForDeletion = true;
    };
    draw(context) {
        context.beginPath();
        context.strokeStyle = 'white';
        context.moveTo(this.x + this.width * 0.5, 0);
        context.lineTo(this.x + this.width * 0.5, this.y + 50);
        context.stroke();
        super.draw(context);
    };
};