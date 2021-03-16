export class Game extends Phaser.Scene{

    constructor(){
        super({key: 'game'});
    }

    preload(){

        //SYMBOLS
        this.load.image('sym_a', 'assets/images/symbols/sym_a.png');
        this.load.image('sym_b', 'assets/images/symbols/sym_b.png');
        this.load.image('sym_c', 'assets/images/symbols/sym_c.png');
        this.load.image('sym_d', 'assets/images/symbols/sym_d.png');
        this.load.image('sym_e', 'assets/images/symbols/sym_e.png');

        //SLOT MACHINE
        this.load.image('frame', 'assets/images/frame.png');

        this.load.image('logo_mobile', 'assets/images/logo_mobile.png');
        this.load.image('prize_window', 'assets/images/prize_window.png');
        this.load.image('btn_spin', 'assets/images/btn_spin.png');

        this.load.image('line_1', 'assets/images/line_1.png');
        this.load.image('line_4', 'assets/images/line_4.png');
        this.load.image('line_5', 'assets/images/line_5.png');
        
    }

    create(){

        //IMAGE SETUP
        this.add.image(490/2,490/2,'frame');

        //this.add.image(490/2,490/2,'logo_mobile');
        this.add.image(100,530,'prize_window');

        this.btn_spin = this.add.sprite(390, 530, 'btn_spin').setInteractive();

        this.btn_spin.on('pointerover', function (event) { this.btn_spin.alpha = 0.5 }, this);
        this.btn_spin.on('pointerout', function (event) { this.btn_spin.alpha = 1 }, this);
        this.btn_spin.on('pointerdown', this.actionOnClick); 
    }

    actionOnClick() {
        console.log("Clicky");
    } 
}