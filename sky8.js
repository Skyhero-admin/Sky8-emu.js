const mem=4096;
const registers=16;

class Sky8{
    constructor(Screen,Keyboard){
        this.memory= new Uint8Array(mem);
        this.v= new Uint8Array(registers);
        this.index=0;
        this.pc=0x200;
        this.stack=[];
        this.sp=0;
        this.delayTimer=0;
        this.soundTimer=0;
        this.Keyboard=Keyboard;
        this.Screen=Screen;
        this.paused=false;
        this.speed=10;
    }
    spritesToMem() {
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];
        for (let i = 0; i < sprites.length; i++) {
            this.memory[i] = sprites[i];
        }
    }

    programToMem(program){
        for(let i=0; i<program.length;i++){
            this.memory[0x200+i]=program[i];
        }
    }

    cycle(){
        for(let i=0;i<this.speed;i++){
            if(!this.paused){
                let opcode=(this.memory[this.pc]<<8 |this.memory[this.pc+1]);
                this.interpret(opcode);
            }
        }
        if(!this.paused)
            this.updateTimer();
        //work on it this.sound();
        this.Screen.fill();
    }
    updateTimer(){
        if(this.delayTimer>0)
            this.delayTimer-=1;
        if(this.soundTimer>0)
            this.soundTimer-=1;
    }
    interpret(instruction){
        this.pc +=2;
        x=(instruction & 0x0F00) >>8;
        y=(instruction & 0x00F0) >>4;

        switch(instruction & 0xF000){
            case 0x0000:
                switch(instruction){
                    case 0x00E0:
                        this.Screen.clearscr();
                        break;
                    case 0x0EE:
                        this.pc=this.stack.pop();
                }
                break;
            case 0x1000:
                this.pc=instruction & 0xFFF;
                break;
            case 0x2000:
                this.stack.push(this.pc);
                this.pc=(instruction & 0xFFF);
                break;
            case 0x3000:
                if(this.v(x)==(instruction & 0xFF)){
                    this.pc+=2;
                }
                break;
            case 0x4000:
                if(this.v[x] !=(instruction & 0xFF)){
                    this.pc+=2;
                }
            case 0x5000:
                if(this.v[x]==this.v[y]){
                    this.pc+=2;
                }
                break;
            case 0x6000:
                this.v[x]=(instruction & 0xFF);
                break;
            case 0x7000:
                this.v[x]+=this.v[y];
                break;
            case 0x8000:
                switch(instruction & 0xF){
                    case 0x0:
                        this.v[x]==this.v[y];
                        break;
                    case 0x1:
                        this.v[x]=this.v[x] | this.v[y];
                    case 0x2:
                        this.v[x]=this.v[x] & this.v[y];
                    case 0x3:
                        this.v[x]=(this.v[x] ^=this.v[y]);
                    case 0x4:
                        let add=this.v[x]+this.v[y];
                        this.v[0xF]=0;

                        if(add>0xFF){
                            this.v[0xF]=1;
                        }
                        this.v[x]=sum;
                        break;
                    case 0x5:
                        let sub=this.v[x]-this.v[y];
                        this.v[0xF]=1;

                        if(this.v[x]<this.v[y]){
                            this.v[0xF]=0;
                        }
                        this.v[x]=sub;
                        break;
                    case 0x6:
                        //work on it
                        this.v[0xF] = this.v[x] & 0x1;
                        this.v[x]=(this.v[x])/2;
                        break;
                    case 0x7:
                        this.v[0xF]=0;
                        if(this.v[x]<this.v[y]){
                            this.v[0xF]=1;
                        }
                        this.v[x]=this.v[y]-this.v[y];
                        break;
                    case 0xE:
                        //work on it
                        this.v[0xF]=this.v[x] & 0x10;
                        break;
                }
            case 0x9000:
                if(this.v[x]!=this.v[y]){
                    this.pc+=2;
                }
                break;
            case 0xA000:
                this.v[index]=(instruction & 0x0FFF);
                break;
            case 0xB000:
                this.pc=(instruction & 0xFFF)+this.v[0];
                break;
            case 0xC000:
                let rand=Math.floor(Math.random()*0xFF);
                this.v[x]=(instruction & 0xFF) & rand;
                break;
            case 0xD000:
                //work on it
                let width = 8;
                let height = (instruction & 0xF);
                
                this.v[0xF] = 0;

                for(let row = 0; row < height; row++) {
                    let sprite = this.memory[this.index + row];

                    for(let col = 0; col < width; col++) {
                        if((sprite & 0x80) > 0) {
                            if(this.Screen.setPixel(this.v[x] + col, this.v[y] + row)) {
                                this.v[0xF] = 1;
                            }
                        }
                        sprite <<= 1;
                    }
                }


                break;
            case 0xE000:
                switch(instruction & 0xF){
                    case 0xE:
                        if(this.Keyboard.isKeyPressed[this.v[x]]){
                            this.pc+=2;
                        }
                        break;
                    case 0x1:
                        if(!this.Keyboard.isKeyPressed(this.v[x])){
                            this.pc+=2;
                        }
                        break;
                    default:
                        throw new Error("BAD OPCODE");
                }
            case 0xF000:
                switch(instruction & 0xFF){
                    case 0x07:
                        this.v[x]=this.delayTimer;
                        break;
                    case 0x0A:
                        //work on it
                        this.paused=true;
                        let nextKeyPress=(key)=>{
                            this.v[x]=key;
                            this.paused=false;
                        };

                        this.Keyboard.onNextKeyPress=nextKeyPress.bind(this);
                        break;
                    case 0x15:
                        this.delayTimer=this.v[x];
                        break;
                    case 0x18:
                        this.soundTimer=this.v[x];
                        break;
                    case 0x1E:
                        this.v[index]+=this.v[x];
                        break;
                    case 0x29:
                        //work on it
                        this.index=this.v[x]*5;
                        break;
                    case 0x33:
                        //work on it
                        this.memory[this.index]=parseInt(this.v[x]/100);
                        this.memory[this.index+1]=parseInt(this.v[x]%100/10);
                        this.memory[this.index+2]=parseInt(this.v[x]%100);
                        break;
                    case 0x55:
                        for(let i=0;i<=x;i++){
                            this.memory[this.index+i]=this.v[i];
                        }
                        break;
                    case 0x65:
                        for(let i=0;i<=x;i++){
                            this.v[i]=this.memory[this.index+i];
                        }
                        break;
                    default:
                        throw new Error("0xF BAD OPCODE "+instruction);
                        break;

                }
                break;
            default:
             throw new Error("BAD OPCODE");

        }
    }

}

export default Sky8;