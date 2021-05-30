const mem=4096;
const registers=16;

class Sky8{
    constructor(Screen){
        this.memory= new Uint8Array(mem);
        this.v= new Uint8Array(registers);
        this.index=0;
        this.pc=0x200;
        this.stack=[];
        this.sp=0;
        this.delayTimer=0;
        this.soundTimer=0;
        //Keyboard
        this.Screen=Screen;
        this.paused=false;
        this.speed=10;
    }

}

export default Sky8;