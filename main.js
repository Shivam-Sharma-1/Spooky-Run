/** @type {HTMLCanvasElement} */
import { Player } from "./components/player.js";
import { InputHandler } from "./components/input.js";
import { Background } from "./components/background.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from "./components/enemy.js";
import { UI } from "./components/UI.js";


window.addEventListener('load', () => {
    /** @type {HTMLCanvasElement} */

    const canvas = document.getElementById('canvas1');
    const instructions = document.getElementById('instructions');
    const body = document.querySelector('body');
    const fullScreenButton = document.getElementById('fullScreenButton');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth - 500;
    canvas.height = 500;

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 50; // provides margin from the ground 
            this.speed = 0; // game starts with the player in sitting state
            this.maxSpeed = 4;
            this.background = new Background(this);
            this.player = new Player(this); // passes game object to player class
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.enemies = [];
            this.particles = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.soundEffects = [];
            this.maxParticles = 200; // maximum particles that can be emitted from an action
            this.energy = 30;  // sets the initial amount of energy when the game begins 
            this.maxEnergy = 30; // sets the maximum energy
            this.rollDisabled = false;
            this.lives = 5; // sets the number of lives
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.debug = false; // press i to debug
            this.score = 0;
            this.winningScore = 30; // sets the winning score
            this.fontColor = 'black';
            this.time = 0;
            this.maxTime = 30000; // sets the time limit
            this.gameOver = false;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        };
        update(deltaTime) {
            // handle score 
            if(this.score <=0) this.score = 0; // prevents the score from going negative

            // handle time
            this.time += 20;
            if(this.time > this.maxTime) this.gameOver = true;
            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            // handle energy
            if(this.energy <= 0) {
                this.energy = 0;
                this.rollDisabled = true;
            };
            if(this.energy > this.maxEnergy) this.energy = this.maxEnergy;
            if(this.energy > 5) this.rollDisabled = false;
            if(this.energy < this.maxEnergy) this.energy += 1 * 0.01;
            
            // handle enemies
            if(this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else this.enemyTimer += deltaTime;
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
            });

            // handle floating messages 
            this.floatingMessages.forEach(message => {
                message.update(deltaTime);
            });

            // handle particles
            this.particles.forEach((particle) => {
                particle.update();
            });
            if(this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            };

            // handle collision sprites
            this.collisions.forEach((collision) => {
                collision.update(deltaTime);
            });

            // handle audio
            this.soundEffects.forEach((sound) => {
                sound.play();
            });
            this.soundEffects = []; // empties the array after playing the sound

            // deletion
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
        };
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(particle => {
                particle.draw(context);
            });
            this.collisions.forEach(collision => {
                collision.draw(context);
            });
            this.floatingMessages.forEach(message => {
                message.draw(context);
            });
            
            window.addEventListener('keydown', e => {
                if (e.key === 'Shift' && this.gameOver) this.restartGame();
                if (e.key === 'Enter' && (instructions.style.display !== 'none')) {
                    this.gameStart = true;
                    this.startGame();
                }; 
            });
            this.UI.draw(context);
        };
        addEnemy() {
            if(this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
            else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
            this.enemies.push(new FlyingEnemy(this));
        };
        startGame() {
            this.dogBarkAudio = new Audio;
            this.dogBarkAudio.src = "assets/audio/dog barking.mp3"
            this.soundEffects.push(this.dogBarkAudio);
            instructions.style.display = 'none'
            canvas.style.display = 'inline'
            fullScreenButton.style.display = 'inline'
            body.style.background = 'black'
            this.enemies = [];
            this.score = 0;
            this.energy = 30;
            this.time = 0;
        };
        restartGame() {
            this.dogBarkAudio = new Audio;
            this.dogBarkAudio.src = "assets/audio/dog barking.mp3"
            this.soundEffects.push(this.dogBarkAudio);
            this.player.restart();
            this.background.restart();
            this.enemies = [];
            this.particles = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.player.currentState = this.player.states[0];
            this.score = 0;
            this.energy = 30;
            this.gameOver = false;
            this.time = 0;
            this.lives = 5; 
            animate(0);
        };
        
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function toggleFullScreen() {
        if(!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                alert(`Error, can't enable fullscreen mode: ${err.message}`) ;// detects errors
            })
        } else document.exitFullscreen();
    };

    fullScreenButton.addEventListener('click', toggleFullScreen);

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        if(!game.gameOver) requestAnimationFrame(animate); // updates screen if game is not over
    };
    animate(0);
});

