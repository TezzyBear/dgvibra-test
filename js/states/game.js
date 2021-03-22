export class Game extends Phaser.Scene{

    constructor(){
        super({key: 'game'});
    }

    preload(){

        //Loading Drawn Symbols
        this.load.image('sym_a', 'assets/images/symbols/sym_a.png');
        this.load.image('sym_b', 'assets/images/symbols/sym_b.png');
        this.load.image('sym_c', 'assets/images/symbols/sym_c.png');
        this.load.image('sym_d', 'assets/images/symbols/sym_d.png');
        this.load.image('sym_e', 'assets/images/symbols/sym_e.png');

        //Loading Drawn Line Components
        this.load.image('line_1', 'assets/images/line_1.png');
        this.load.image('line_4', 'assets/images/line_4.png');
        this.load.image('line_5', 'assets/images/line_5.png');

        //Loading Frame Components
        this.load.image('frame', 'assets/images/frame.png');
        this.load.image('frame_top', 'assets/images/frame_top.png');
        this.load.image('frame_bottom', 'assets/images/frame_bottom.png');

        //Loading Button Components
        this.load.image('logo_mobile', 'assets/images/logo_mobile.png');
        this.load.image('prize_window', 'assets/images/prize_window.png');
        this.load.image('btn_spin', 'assets/images/btn_spin.png');       
    }

    create(){

        //Creating API object
        this.wrapper = new Wrapper();
        //Creaing object to store different spin results (every spin button click)
        this.spinData = {};
    
        //Adding frame images to game world
        this.add.image(490/2,490/2,'frame').setDepth(0);
        this.add.image(490/2,30/2,'frame_top').setDepth(3);
        this.add.image(490/2,460+110/2,'frame_bottom').setDepth(3);

        //Creating groups for each reel (column) and storing them in an array
        this.drawnReels = [];
        this.drawnReels[0] = this.add.group(); //sprites in reel
        this.drawnReels[1] = this.add.group();
        this.drawnReels[2] = this.add.group();

        //Creating array to store drawn lines
        this.drawnLines = [];
        
        //Creating array to store variables for each reel
        this.reelVariables = [];
        this.initializeReelVariables();

        //Control variables across all reels
        this.isSpinning = false;
        this.reelsSpinning = 0;
        this.bobTimer = 0.2;

        //Initializing all reels with a top position of 17
        this.initReels(0, 17);
        this.initReels(1, 17);
        this.initReels(2, 17);    
        
        //UI Buttons

        //Win Button Setup
        this.add.image(100, 530, 'prize_window').setDepth(5);
        this.winningsText = this.add.text(100, 530, 'WIN: $0', {
            font: 'bold 20px Arial',
            fill: '#1b3768',
            align: 'center'
        });
        this.winningsText.setOrigin(0.5,0.5);
        this.winningsText.setDepth(5);

        //Spin Button Setup
        this.btn_spin = this.add.sprite(390, 530, 'btn_spin').setInteractive();
        this.btn_spin.setDepth(5);
        this.btn_spin.on('pointerover', function (event) { this.btn_spin.alpha = 0.5 }, this);
        this.btn_spin.on('pointerout', function (event) { this.btn_spin.alpha = 1 }, this);
        this.btn_spin.on('pointerdown', this.actionOnClick, this);
    }

    update(dt){
        if(this.isSpinning){
            // 0 is left reel, 1 is middle reel and 2 is right reel
            this.spinReel(0);
            this.spinReel(1);
            this.spinReel(2);
        }
    }

    actionOnClick() {
        if(!this.isSpinning){
            //Get spin results from API
            this.spinData = this.wrapper.spin();
            console.log(this.spinData);
            this.initializeSpins();
            this.resetReelVariables();
            this.reelsSpinning = 3;
        }        
    }

    initReels(number, topPosition){

        //Add symbol sprites to each reel
        for(let i = 0; i < 3; i++){      
            let spriteKey = this.getSymbolKey(this.wrapper.getReels()[number][i + topPosition]);            
            this.addDrawnSymbol(number, {x: number*143, y: i*143}, spriteKey);
        } 
        //Create reference to top symbol - to manage when to stop reels
        this.reelVariables[number].topSymbol = this.drawnReels[number].getChildren()[0];
    }

    getSymbolKey(reelString){ //Returns key of a sprite based on char contained in reel array 

        let symbolKey = '';
        switch(reelString) {
            case 'a':
                symbolKey = 'sym_a';
              break;
            case 'b':
                symbolKey = 'sym_b';
              break;
            case 'c':
                symbolKey = 'sym_c';
              break;
            case 'd':
                symbolKey = 'sym_d';
              break;
            case 'e':
                symbolKey = 'sym_e';
              break;
            default:
                symbolKey = null;
                console.log("Unexpected reel value");                
        }
        return symbolKey;
    }

    initializeSpins(){
        if(this.isSpinning){ return; }
        this.isSpinning = true;

        //Timer for offset in reel spins based on each reels time shift
        //With a duration of 1.5 seconds
        this.time.delayedCall(this.reelVariables[0].reelTimeShift*1000, this.startReeling, [0, 1.5], this);
        this.time.delayedCall(this.reelVariables[1].reelTimeShift*1000, this.startReeling, [1, 1.5], this); 
        this.time.delayedCall(this.reelVariables[2].reelTimeShift*1000, this.startReeling, [2, 1.5], this);
    }

    spinReel(reelNumber){

        //Do nothing if reel delay offset hasnt been reached yet
        if(this.reelVariables[reelNumber].isReeling == false) { return; } 
       
        //Getting symbol sprites per reel
        let reelSymbols = this.drawnReels[reelNumber].getChildren();
        let reelStopSpeed;

        //Reel bob up animation
        for(let i = 0; i < reelSymbols.length; i++){
            if(this.reelVariables[reelNumber].bobUp){
                reelSymbols[i].y -= 2;
            }
        }
        if(this.reelVariables[reelNumber].bobUp) { return; }

        //Actual reel behaviour
 
        //See if the previously referenced top symbol's vertical position is more than preset value
        if(this.reelVariables[reelNumber].topSymbol.y > 130+51){    
            //Define the position of the top symbol to create       
            let newPos = {x: reelNumber*143, y: (this.reelVariables[reelNumber].topSymbol.y - 103) - 143} 

            //When the spin results are pushed into the spinResultSymbols array, create a new symbol based on this - fixed results
            if(this.reelVariables[reelNumber].spinResultSymbols.length>0){
                //Base creation on spin results          
                let newSpriteKey = this.getSymbolKey(this.reelVariables[reelNumber].spinResultSymbols.pop());            
                let newSymbol = this.addDrawnSymbol(reelNumber, newPos, newSpriteKey)
                this.reelVariables[reelNumber].topSymbol = newSymbol;     

                //Stop reel when all of the desired symbols are drawn.
                if(this.reelVariables[reelNumber].spinResultSymbols.length == 0){ 
                    this.reelVariables[reelNumber].stopReel = true;
                }
            }else{ //Normal  behaviour - Gets the next symbol in the reel array and draws
                //Change top position number, create drawn symbol and change top reference to created symbol
                if(this.reelVariables[reelNumber].topPosition <= 0){
                    this.reelVariables[reelNumber].topPosition=19;
                }else{
                    this.reelVariables[reelNumber].topPosition-=1;
                }

                let newSpriteKey = this.getSymbolKey(this.wrapper.getReels()[reelNumber][this.reelVariables[reelNumber].topPosition]);            
                let newSymbol = this.addDrawnSymbol(reelNumber, newPos, newSpriteKey)
                this.reelVariables[reelNumber].topSymbol = newSymbol;
            }       
        }   
        
        //Stop reels at desired top position (103) and reduce the number of reels spinning (for next 3)
        if(this.reelVariables[reelNumber].stopReel && this.reelVariables[reelNumber].topSymbol.y + this.reelVariables[reelNumber].speed > 103){
            reelStopSpeed = 103 - this.reelVariables[reelNumber].topSymbol.y;            
            this.reelsSpinning--;
        }

        //Show spin results when all reels have stopped
        if(this.reelsSpinning <= 0){
            this.isSpinning = false;
            this.addDrawnLines();            
            this.changeWinnings(this.spinData.winnings);
        }

        //Change speed of symbols in reel and deactivate the symbols that have passed the vertical position threshold
        for(let i = 0; i < reelSymbols.length; i++){            
                if(reelStopSpeed != undefined){
                    reelSymbols[i].y += reelStopSpeed;
                    this.reelVariables[reelNumber].speed = 0;
                }
                reelSymbols[i].y += this.reelVariables[reelNumber].speed;
                     
            if(reelSymbols[i].y > 540){                
                this.drawnReels[reelNumber].killAndHide(reelSymbols[i]);            
            }
        }              
    }

    changeWinnings(number){ //Change win text
        this.winningsText.setText('WIN: $' + number);
    }

    addDrawnLines(){ //Create and store drawn lines based on prize data

        if(this.spinData.prizes.length == 0) { return; }        
        let that = this;
        this.spinData.prizes.forEach(function(val){
            let lineType = val.lineId;
            console.log("Line Id: ", lineType);
            switch(lineType) {
                case 0:
                    that.drawnLines.push(that.add.sprite(100 + 143, 103 + 1*143, 'line_1').setDepth(3));
                  break;
                case 1:
                    that.drawnLines.push(that.add.sprite(100 + 143, 103 + 0*143, 'line_1').setDepth(3));
                  break;
                case 2:
                    that.drawnLines.push(that.add.sprite(100 + 143, 103 + 2*143, 'line_1').setDepth(3));
                  break;
                case 3:
                    that.drawnLines.push(that.add.sprite(100 + 143, 103 + 1*143, 'line_4').setDepth(3));
                  break;
                case 4:
                    that.drawnLines.push(that.add.sprite(100 + 143, 103 + 1*143, 'line_5').setDepth(3));
                  break;
                default:
                    console.log("Unexpected drawn prize line value");                
            }
        });        
    }

    deleteDrawnLines(){ //Destroy each of the drawn lines
        while(this.drawnLines.length > 0){
            let drawnLine = this.drawnLines.pop();
            drawnLine.destroy();
        }
    }

    addDrawnSymbol(reelNumber, position, spriteKey){ //Uses pooling to create and redraw symbols
        let offSetX = 100;
        let offSetY = 103;      
        
        // Find first inactive sprite in group or add new sprite, and set position and depth
        let drawnSymbol = this.drawnReels[reelNumber].get(offSetX + position.x, offSetY + position.y);
        drawnSymbol.setDepth(1);
        
        // None free or already at maximum amount of sprites in group
        if (!drawnSymbol) return;

        this.activateDrawnSymbol(drawnSymbol, spriteKey);
        
        return drawnSymbol;
    }

    activateDrawnSymbol(symbol, texture){ //Set variables por reutilized symbol sprite
        symbol
        .setActive(true)
        .setVisible(true)
        .setTexture(texture);
    }

    startReeling(reelNumber, reelDuration){ //Initialize reeling process (with bob)
        //console.log("STARTING REEL: ", reelNumber);

        this.reelVariables[reelNumber].bobUp = true;
        this.time.delayedCall(this.bobTimer*1000, this.stopBob, [reelNumber], this);

        this.reelVariables[reelNumber].isReeling = true;

        this.time.delayedCall(reelDuration*1000 + this.bobTimer*1000, this.stopReeling, [reelNumber], this);
    }

    stopBob(reelNumber){ //This will stop bobbing
        this.reelVariables[reelNumber].bobUp = false;
    }

    stopReeling(reelNumber){ //Stops reel and pushes reel result data to array

        this.reelVariables[reelNumber].shouldStop = true;
        for(let i = 0; i < this.spinData.reelsLayout.length; i++){
            this.reelVariables[reelNumber].spinResultSymbols.push(this.spinData.reelsLayout[reelNumber][i]);
        }
        //console.log("STOPING REEL ON: ",
        // this.reelVariables[reelNumber].spinResultSymbols[0],
        // this.reelVariables[reelNumber].spinResultSymbols[1],
        // this.reelVariables[reelNumber].spinResultSymbols[2]);
    }
    initializeReelVariables(){ //Init reel variables
        this.reelVariables[0] = 
        { topPosition: 17, speed:15 , topSymbol: null, isReeling: false,
             reelTimeShift: 0, shouldStop: false, spinResultSymbols: [], stopReel: false, bobUp: true };

        this.reelVariables[1] = 
        { topPosition: 17, speed:15, topSymbol: null, isReeling: false,
             reelTimeShift: 0.4, shouldStop: false, spinResultSymbols: [], stopReel: false, bobUp: true };

        this.reelVariables[2] = 
        { topPosition: 17, speed:15, topSymbol: null, isReeling: false,
             reelTimeShift: 0.8, shouldStop: false, spinResultSymbols: [], stopReel: false, bobUp: true };
    }
    resetReelVariables(){ //Reset reel variables (minus top Symbol)
        this.reelVariables[0] = 
        { topPosition: 17, speed:15 , topSymbol: this.reelVariables[0].topSymbol, isReeling: false,
             reelTimeShift: 0, shouldStop: false, spinResultSymbols: [], stopReel: false, bobUp: true};

        this.reelVariables[1] = 
        { topPosition: 17, speed:15, topSymbol: this.reelVariables[1].topSymbol, isReeling: false,
             reelTimeShift: 0.4, shouldStop: false, spinResultSymbols: [], stopReel: false, bobUp: true };

        this.reelVariables[2] = 
        { topPosition: 17, speed:15, topSymbol: this.reelVariables[2].topSymbol, isReeling: false,
             reelTimeShift: 0.8, shouldStop: false, spinResultSymbols: [], stopReel: false, bobUp: true };

        this.changeWinnings(0); 
        this.deleteDrawnLines();
    }
}