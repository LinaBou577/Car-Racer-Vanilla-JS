const score = document.querySelector('.score');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');
const level = document.querySelector('.level');

// loading audio files

let gameStart = new Audio();
let gameOver = new Audio();
gameStart.src = "assets/audio/game_theme.mp3";
gameOver.src = "assets/audio/gameOver_theme.mp3";

const XCONTROLSPEED = 7;
const YCONTROLSPEED = 10;
const levelSpeed = {easy: 7, moderate: 10, difficult: 14};
var port;
var lineBuffer = '';

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}
let player = { speed: 7, score: 0, xspeed: 0, yspeed: 0};
level.addEventListener('click', (e)=> {
    player.speed = levelSpeed[e.target.id];
});

startScreen.addEventListener('click', () => {
    // gameArea.classList.remove('hide');
    startScreen.classList.add('hide');
    gameArea.innerHTML = "";

    player.start = true;
    gameStart.play();
    gameStart.loop = true;
    player.score = 0;
    window.requestAnimationFrame(gamePlay);

    for(let i=0; i<5; i++){
        let roadLineElement = document.createElement('div');
        roadLineElement.setAttribute('class', 'roadLines');
        roadLineElement.y = (i*150);
        roadLineElement.style.top = roadLineElement.y + "px";
        gameArea.appendChild(roadLineElement);
    }

    let carElement = document.createElement('div');
    carElement.setAttribute('class', 'car');
    gameArea.appendChild(carElement);

    player.x = carElement.offsetLeft;
    player.y = carElement.offsetTop  ;

    for(let i=0; i<3; i++){
        let enemyCar = document.createElement('div');
        enemyCar.setAttribute('class', 'enemyCar');
        enemyCar.y = ((i+1) * 350) * - 1;
        enemyCar.style.top = enemyCar.y + "px";
        enemyCar.style.backgroundColor = randomColor();
        enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
        gameArea.appendChild(enemyCar);
    }
});

function randomColor(){
    function c(){
        let hex = Math.floor(Math.random() * 256).toString(16);
        return ("0"+ String(hex)).substr(-2);
    }
    return "#"+c()+c()+c();
}

function onCollision(a,b){
    aRect = a.getBoundingClientRect();
    bRect = b.getBoundingClientRect();

    return !((aRect.top >  bRect.bottom) || (aRect.bottom <  bRect.top) ||
        (aRect.right <  bRect.left) || (aRect.left >  bRect.right)); 
}

function onGameOver() {
    player.start = false;
    gameStart.pause();
    gameOver.play();
    startScreen.classList.remove('hide');
    startScreen.innerHTML = "Game Over <br> Your final score is " + player.score + "<br> Press here to restart the game.";
}

function moveRoadLines(){
    let roadLines = document.querySelectorAll('.roadLines');
    roadLines.forEach((item)=> {
        if(item.y >= 700){
            item.y -= 750;
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function moveEnemyCars(carElement){
    let enemyCars = document.querySelectorAll('.enemyCar');
    enemyCars.forEach((item)=> {

        if(onCollision(carElement, item)){
            onGameOver();
        }
        if(item.y >= 750){
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 350) + "px";
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
} 

function gamePlay() {
    let carElement = document.querySelector('.car');
    let road = gameArea.getBoundingClientRect();

    if(player.start){
        moveRoadLines();
        moveEnemyCars(carElement);
	
	if(player.xspeed <= 0 && player.x > 0) player.x += player.xspeed;
        if(player.xspeed >= 0 && player.x < (road.width - 70)) player.x += player.xspeed;
	
	if(player.yspeed <= 0 && player.y > (road.top + 70)) player.y += player.yspeed;
        if(player.yspeed >= 0 && player.y < (road.bottom - 85)) player.y += player.yspeed;
        
	carElement.style.top = player.y + "px";
        carElement.style.left = player.x + "px";

        window.requestAnimationFrame(gamePlay);

        player.score++;
        const ps = player.score - 1;
        score.innerHTML = 'Score: ' + ps;          
    }
}
document.addEventListener('keydown', (e)=>{
	if (e.key == "c") {
	listSerial();
	return;
}
    e.preventDefault();
    keys[e.key] = true;
});

document.addEventListener('keyup', (e)=>{
    e.preventDefault();
    keys[e.key] = false;
});

class LineBreakTransformer {
        constructor() {
            // A container for holding stream data until a new line.
            this.chunks = "";
        }

        transform(chunk, controller) {
            // Append new chunks to existing chunks.
            this.chunks += chunk;
            // For each line breaks in chunks, send the parsed lines out.
            const lines = this.chunks.split("\r\n");
            this.chunks = lines.pop();
            lines.forEach((line) => controller.enqueue(line));
        }

        flush(controller) {
            // When the stream is closed, flush any remaining chunks out.
            controller.enqueue(this.chunks);
        }
    }
async function getReader() {
		var port = await navigator.serial.requestPort({});
		await port.open({ baudRate: 115200 });
		const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable
            .pipeThrough(new TransformStream(new LineBreakTransformer()))
            .getReader();
        
        // Listen to data coming from the serial device.
        let lastind = 0;
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                console.log("here");
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            //console.log(value);
	    const valdata = value.split (" ");
		player.xspeed = Number(valdata[1])/XCONTROLSPEED;
		player.yspeed = -Number(valdata[0])/YCONTROLSPEED;

           }
        
        
		
	}
	function listSerial() {
	    
	    if (port) {
		    port.close();
		    port = undefined;
		}
		else {
		  console.log("Look for Serial Port")
		  getReader();

		}
	}
