/** @type {HTMLCanvasElement} */
import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit, AirHit } from "./playerStates.js";
import { CollisionAnimation } from "./collisionAnimation.js";
import { FloatingMessage } from "./floatingMessages.js";
import { HitSplash } from "./particles.js";
import { ClimbingEnemy, GroundEnemy } from "./enemy.js";
export { FlyingEnemy, GroundEnemy, ClimbingEnemy } from "./enemy.js";
export { Player };

class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = 20;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame;
        this.fps = 20; // given sprite sheet is most optimal at 20fps
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0; // running speed
        this.vy = 0; // jumping speed
        this.weight = 1; // acts as gravity
        this.maxSpeed = 10;
        this.states = [new Sitting(this.game), new Running(this.game), new Jumping(this.game), new Falling(this.game), new Rolling(this.game), new Diving(this.game), new Hit(this.game), new AirHit(this.game)];
        this.currentState = null;
    };
    update(input, deltaTime) {
        // keeps checking for collisions
        this.checkCollision();

        // keeps updating the inputs
        this.currentState.handleInput(input);

        // horizontal movement
        this.x += this.speed;
        // horizontal speeds are set here so that these controls work for all states
        if((input.includes('ArrowRight') || input.includes('d')) && this.currentState !== this.states[6] && this.currentState !== this.states[7]) this.speed = this.maxSpeed;
        else if((input.includes('ArrowLeft') || input.includes('a')) && this.currentState !== this.states[6] && this.currentState !== this.states[7]) this.speed = -this.maxSpeed;
        else this.speed = 0;
        // horizontal boundaries
        if(this.x < 20) this.x = 20;
        if(this.x > this.game.width - this.width) this.x = this.game.width - this.width;

        // vertical movement
        // vertical speeds are set in playerStates to provide accessibility to falling animation
        this.y += this.vy;
        if(!this.onGround()) this.vy += this.weight;
        else this.vy = 0;
        //vertical boundaries
        if(this.y > this.game.height - this.height - this.game.groundMargin) this.y = this.game.height - this.height - this.game.groundMargin;

        // sprite animation
        if(this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        };
    };
    draw(context) {
        if(this.game.debug) {
            context.strokeStyle = 'white';
            context.strokeRect(this.x + 10, this.y + 15, this.width - 20, this.height - 20);
        };
        // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        context.drawImage(this.image, this.width * this.frameX, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    };
    onGround() { // checks if player is on ground
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    };
    setState(state, speed) {
        this.currentState = this.states[state];
        this.game.speed = this.game.maxSpeed * speed;
        this.currentState.enter();
    };
    restart() {
        this.x = 20;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.maxFrame = 4;
        this.frameY = 5;
        this.setState(0, 0);
    };
    checkCollision() {
        this.game.enemies.forEach(enemy => {
            if( enemy.x < this.x + 10 + this.width - 20 &&
                enemy.x + enemy.width - 20 > this.x + 10 &&
                enemy.y < this.y + this.height &&
                enemy.y + enemy.height > this.y){
                enemy.markedForDeletion = true;
                this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                if(this.currentState === this.states[4] ||
                    this.currentState === this.states[5]) {
                    this.collisionAudio = new Audio;
                    this.collisionAudio.src = 'assets/audio/collision.wav';
                    this.game.soundEffects.push(this.collisionAudio);
                    if(enemy instanceof GroundEnemy) {
                        this.game.score += 2;
                        this.game.floatingMessages.push(new FloatingMessage('+2' , enemy.x, enemy.y, 130, 50));
                    } else  if(enemy instanceof ClimbingEnemy) {
                        this.game.score += 3;
                        this.game.floatingMessages.push(new FloatingMessage('+3' , enemy.x, enemy.y, 130, 50)); 
                    } else {
                        this.game.score++;
                        this.game.floatingMessages.push(new FloatingMessage('+1' , enemy.x, enemy.y, 130, 50));
                    }
                } else {
                    this.collisionAudio = new Audio;
                    this.collisionAudio.src = "assets/audio/bloodSplash.mp3";
                    this.game.soundEffects.push(this.collisionAudio);
                    this.game.lives--;
                    // if(this.game.score > 0) this.game.score -= 5;
                        if(this.game.lives <= 0) this.game.gameOver = true;
                    for(let i=0; i<20; i++) {
                        this.game.particles.unshift(new HitSplash(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player. height * 0.5 + 15));
                    };
                    if(!this.onGround()) {
                           this.setState(7, 0);
                    } else this.setState(6, 0);
                };
            };
        });
    };
};