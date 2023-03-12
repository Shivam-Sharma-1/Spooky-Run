/** @type {HTMLCanvasElement} */
export { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit, AirHit };
import { Dust, DustCloud, Fire, Splash } from "./particles.js";

const states = {
    SITTING: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3,
    ROLLING: 4,
    DIVING: 5,
    HIT: 6,
    AIRHIT: 7,
};

class State {
    constructor(state, game) {
        this.state = state;
        this.game = game;
    };
};

class Sitting extends State {
    constructor(game) {
        super('SITTING', game);
    };
    enter() {
        this.dogBarkAudio = new Audio;
        this.dogBarkAudio.src = "assets/audio/dog barking.mp3";
        this.game.soundEffects.push(this.dogBarkAudio);
        this.game.player.frameX = 0; // to avoid blinking during state change
        this.game.player.maxFrame = 4;
        this.game.player.frameY = 5;
    };
    handleInput(input) {
        if( input.includes('ArrowLeft') ||
            input.includes('a') ||
            input.includes('ArrowRight') ||
            input.includes('d')
        ) this.game.player.setState(states.RUNNING, 2);
        else if(input.includes(' ')) this.game.player.setState(states.ROLLING, 3);
        else if( input.includes('ArrowUp') ||
        input.includes('w')) this.game.player.setState(states.JUMPING, 2);
    };
};

class Running extends State {
    constructor(game) {
        super('RUNNING', game);
    };
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 8;
        this.game.player.frameY = 3;
    };
    handleInput(input) {
        this.game.particles.push(new Dust(this.game, this.game.player.x + this.game.player.width * 0.4, this.game.player.y + this.game.player.height - 6)); // generates dust when player runs
        if( input.includes('ArrowDown') ||
            input.includes('s')
        ) this.game.player.setState(states.SITTING, 0);
        else if ( input.includes('ArrowUp') ||
                    input.includes('w')
        ) this.game.player.setState(states.JUMPING, 2);
        else if(input.includes(' ') && !this.game.rollDisabled) this.game.player.setState(states.ROLLING, 3);
    };
};

class Jumping extends State {
    constructor(game) {
        super('JUMPING', game);
    };
    enter() {
        this.jumpAudio = new Audio;
        this.jumpAudio.src = "assets/audio/jump.wav";
        this.game.soundEffects.push(this.jumpAudio);
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        if(this.game.player.onGround()) this.game.player.vy -= 27;
        this.game.player.frameY = 1;
        for(let i=0; i<40; i++) {
            this.game.particles.unshift(new DustCloud(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player.height ));
        };
    };
    handleInput(input) {
        if(this.game.player.vy > this.game.player.weight) this.game.player.setState(states.FALLING, 2);
        else if(input.includes(' ')) this.game.player.setState(states.ROLLING, 3);
        else if(input.includes('ArrowDown') || input.includes('s')) this.game.player.setState(states.DIVING, 0);
        else if(input.includes(' ')) this.game.player.setState(states.ROLLING, 3);
    };
};

class Falling extends State {
    constructor(game) {
        super('FALLING', game);
    };
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 2;
    };
    handleInput(input) {
        if(this.game.player.onGround()) {
            this.game.player.setState(states.RUNNING, 2);
            for(let i=0; i<40; i++) {
                this.game.particles.unshift(new DustCloud(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player.height ));
            };
        } else if(input.includes('ArrowDown') || input.includes('s')) this.game.player.setState(states.DIVING, 0);
    };
};

class Rolling extends State {
    constructor(game) {
        super('ROLLING', game);
    };
    enter() {
        this.rollingAudio = new Audio;
        this.rollingAudio.src = "assets/audio/rolling.wav";
        this.game.soundEffects.push(this.rollingAudio)
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 6;
    };
    handleInput(input) {
        // handle energy
            if(!this.game.rollDisabled && this.game.energy > 0) {
                this.game.energy -= .1;
                this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.4, this.game.player.y + this.game.player.height * 0.5 )); // generates fire when player rolls
                if(!input.includes(' ') && this.game.player.onGround()) this.game.player.setState(states.RUNNING, 2);
                else if(!input.includes(' ') && !this.game.player.onGround()) this.game.player.setState(states.FALLING, 2);
                else if (input.includes(' ') && (input.includes('ArrowUp') || input.includes('w')) && this.game.player.onGround()) {
                    this.jumpAudio = new Audio;
                    this.jumpAudio.src = "assets/audio/jump.wav";
                    this.game.soundEffects.push(this.jumpAudio);
                    this.game.player.vy -= 27;
                } else if((input.includes('ArrowDown') || input.includes('s')) && !this.game.player.onGround()) this.game.player.setState(states.DIVING, 0);
            } else this.game.player.setState(states.RUNNING, 2);
    };
};

class Diving extends State {
    constructor(game) {
        super('DIVING', game);
    };
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 6;
        this.game.player.vy = 15;
    };
    handleInput(input) {
        if(this.game.player.onGround()) {
            this.divingAudio = new Audio;
            this.divingAudio.src = "assets/audio/Fireimpact.wav";
            this.game.soundEffects.push(this.divingAudio);
        }
        this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.4, this.game.player.y + this.game.player.height * 0.5 )); // generates fire when player rolls
        if(this.game.player.onGround()) { // splash animation
            this.game.player.setState(states.RUNNING, 2);
            for(let i=0; i<40; i++) {
                this.game.particles.unshift(new Splash(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player. height * 0.5));
            };
        } else if(input.includes(' ') && this.game.player.onGround()) this.game.player.setState(states.ROLLING, 3);
    };
};

class Hit extends State {
    constructor(game) {
        super('HIT', game);
    };
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 10;
        this.game.player.frameY = 4;
    };
    handleInput() {
        if(this.game.player.frameX >= this.game.player.maxFrame && this.game.player.onGround()) {
            this.healingAudio = new Audio;
            this.healingAudio.src = "assets/audio/Healing.wav";
            this.game.soundEffects.push(this.healingAudio);
            this.game.player.setState(states.RUNNING, 2);
        } else if(this.game.player.frameX >= this.game.player.maxFrame && !this.game.player.onGround()) this.game.player.setState(states.FALLING, 2);
    };
};

class AirHit extends State {
    constructor(game) {
        super('AIRHIT', game);
    };
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 11;
        this.game.player.frameY = 8;
    };
    handleInput() {
        if(this.game.player.frameX >= this.game.player.maxFrame && this.game.player.onGround()) {
            this.healingAudio = new Audio;
            this.healingAudio.src = "assets/audio/Healing.wav"
            this.game.soundEffects.push(this.healingAudio);
            this.game.player.setState(states.RUNNING, 2);
        } else if(this.game.player.frameX >= this.game.player.maxFrame && !this.game.player.onGround()) this.game.player.setState(states.FALLING, 2);
    };
};