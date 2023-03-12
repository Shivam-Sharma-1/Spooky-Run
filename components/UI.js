/** @type {HTMLCanvasElement} */
export { UI };

class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Creepster';
        this.livesImage = document.getElementById('lives');
    };
    draw(context) {
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.font = `${this.fontSize}px ${this.fontFamily}`;
        context.textAlign = 'left';
        context.fillStyle = this.game.fontColor;

        // score
        context.fillText(`Score: ${this.game.score}`, 20, 50);

        //timer
        context.font = `${this.fontSize * 0.8}px ${this.fontFamily}`;
        context.fillText(`Time: ${(this.game.time * 0.001).toFixed(1)}`, 20, 80);

        // energy
        context.font = `${this.fontSize * 0.8}px ${this.fontFamily}`;
        context.fillText(`Energy: ${(this.game.energy).toFixed(1)}`, 20, 150);

        //lives
        for(let i=0; i<this.game.lives; i++) {
            context.drawImage(this.livesImage, 25 * i + 20, 95, 25, 25);
        };

        // game over messages
        if(this.game.gameOver) {
            context.textAlign = 'center';
            context.font = `${this.fontSize * 2}px ${this.fontFamily}`;
            context.fillStyle = '#d0d2d3';
            context.shadowColor = 'black';
            if(this.game.score > this.game.winningScore) {
                context.fillText('Boo-yah!', this.game.width * 0.5, this.game.height * 0.5 - 60);
                context.font = `${this.fontSize * 0.7}px ${this.fontFamily}`;
                context.fillText('Press shift to restart', this.game.width * 0.5, this.game.height * 0.5 + 20);
                context.fillText('What are the creatures of the night afraid of? YOU!!!', this.game.width * 0.5, this.game.height * 0.5 - 20);
                this.winAudio = new Audio;
                this.winAudio.src = 'assets/audio/booyah.wav'
                this.winAudio.play();
            } else {
                context.fillText('Love at first bite?', this.game.width * 0.5, this.game.height * 0.5 - 60);
                context.font = `${this.fontSize * 0.7}px ${this.fontFamily}`;
                context.fillText('Nope. Better luck next time!', this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.fillText('Press shift to restart', this.game.width * 0.5, this.game.height * 0.5 + 20);
                this.loseAudio = new Audio;
                this.loseAudio.src = 'assets/audio/game-over.wav'
                this.loseAudio.play();
            };
        };
        context.restore();
    };
};