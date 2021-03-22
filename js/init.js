import { Game } from './states/game.js';

const config = {
	type: Phaser.AUTO,
	width: 490,
	height: 570,
	scene: [Game],
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    }
}

var game = new Phaser.Game(config);