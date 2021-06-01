import Screen from './screen.js';
import Sky8 from './sky8.js';
import Keyboard from './keyboard.js';

var screen= new Screen(document.getElementById('screen'));
var keyboard=new Keyboard();
var sky8=new Sky8(screen,keyboard);


function load(game){
	let url='/games/${name}';

	function step(){
		now=Date.now();
		elapsed=now-then;

		if(elapsed>fpsGap){
			sky8.cycle();
		}

		loop=requestAnimationFrame(step);
	}

	fetch(url).then(res =>res.arrayBuffer() )
	.then(buffer =>{
		const program=new Uint8Array(buffer);
		fpsGap=1000/FPS;
		then=Date.now();
		startTime=then;
		sky8.spritesToMem();
		sky8.programToMem();
		loop=requestAnimationFrame(step);
	})
}

screen.test();