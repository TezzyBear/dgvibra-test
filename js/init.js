import { Game } from './states/game.js';

const config = {
	type: Phaser.AUTO,
	width: 490,
	height: 570,
	scene: [Game]
}

var game = new Phaser.Game(config);