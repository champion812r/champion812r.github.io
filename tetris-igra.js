let images = ["tetris-dodatno/images/light_blue.png", "tetris-dodatno/images/dark_blue.png", "tetris-dodatno/images/orange.png", "tetris-dodatno/images/yellow.png", "tetris-dodatno/images/green.png","tetris-dodatno/images/purple.png","tetris-dodatno/images/red.png"];
let grid = null;
let M = 20, N = 10;
let players = []

const BlockTypes = {
    I : [[0,1],[0,2],[0,0],[0,3]],
    J : [[1,1],[1,0],[0,0],[1,2]],
    L : [[1,1],[1,0],[1,2],[0,2]],
    O: [[1,1],[1,0],[0,1],[0,0]],
    S: [[1,1],[1,0],[0,1],[0,2]],
    T: [[1,1],[1,0],[1,2],[0,1]],
    Z: [[1,1],[0,0],[0,1],[1,2]]
};
// const Colors = {
//     LightBlue: 0,
//     DarkBlue: 1,
//     Orange: 2,
//     Yellow: 3,
//     Green: 4,
//     Purple: 5,
//     Red: 6
// };

const State = {
    Spawn: 0,
    Move: 1,
    GameOver: 2,
    Suspend: 3
}



function copyArray(obj) {
    const newObj = [];
    for(let i=0; i<obj.length; ++i){
        if(typeof obj[i] === 'object'){
            newObj[i] = copyArray(obj[i]);
        } else {
            newObj[i] = obj[i];
        }
    }
    return newObj;
}

class GridField{
    constructor(owner=null){
        this.owner = owner;
    }
}
class Block{
    static lastID = 0;
    constructor(fields, y=0, x=0, color=0){
        // (x,y) inicijalna pozicija gore-levo kornera
        this.type = fields;
        this.fields = copyArray(fields);
        this.incByX(x);
        this.incByY(y);
        this.color = color;
        this.ID = Block.lastID++;
    }
    static rotateField(field, pivot, dir=1){
        let Fx = field[1], Fy = -field[0];
        let Px = pivot[1], Py = -pivot[0];
        Fx -= Px;
        Fy -= Py;

        let newX = 0*Fx + dir*Fy;
        let newY = -dir*Fx + 0*Fy;

        newX += Px;
        newY += Py;

        return [-newY, newX];
    }

    incByY(inc=1, yLimit=M){
        this.fields.forEach(function(field,idx){
            if(field[0] <= yLimit)
                field[0]+=inc;
        })
    }
    incByX(inc=1){
        // console.log("BLOK: ");
        // logBlock(this);
        // console.log("povecan X za ", inc);
        this.fields.forEach(function(field,idx){
            field[1]+=inc;
        })
    }
    checkMove(newX, newY, fakeOwner=this){
        if(newY >= M || newX >= N || newX<0) {
            return false;
        }
        if(newY<0) return true;
        let owner = grid[newY][newX].owner;
        if(owner && owner!= this && owner!=fakeOwner) {
            return false;
        }
        return true;
    }
    moveLeft(){
        const self = this;
        let ret = false;
        this.fields.forEach(function(field,idx){
            let newY = field[0];
            let newX = field[1] - 1;
            if(!self.checkMove(newX, newY)){
                ret = true;
                return;
            }
        });
        if(ret) return 0;

        this.incByX(-1);
        return 1;
    }
    moveRight(){
        const self = this;
        let ret = false;
        this.fields.forEach(function(field,idx){
            let newY = field[0];
            let newX = field[1] + 1;
            if(!self.checkMove(newX, newY)){
                ret = true;
                return;
            }
        });
        if(ret) return 0;

        this.incByX(+1);
        return 1;
    }
    moveDown(disp=1, fakeOwner=this){

        const self = this;
        let ret = false;
        this.fields.forEach(function(field,idx){
            if(ret) return;
            let newY = field[0] + disp;
            let newX = field[1];
            if(!self.checkMove(newX, newY, fakeOwner)){
                ret = true;
                return;
            }
        });
        if(ret) return 0;

        this.incByY(+disp);
        return 1;
    }
}

let blocks = [
    // new Block(BlockTypes.L_block, 0,0,0),
    // new Block(BlockTypes.J_block, 2,0,1),
    // new Block(BlockTypes.I_block, 4,0,2),
    // new Block(BlockTypes.S_block, 6,0,3),
    // new Block(BlockTypes.Z_block, 8,0,4),
    // new Block(BlockTypes.T_block, 10,0,5),
    // new Block(BlockTypes.O_block, 12,0,6),
];

function random(min, max) {
    let rnd = Math.random();
    return Math.floor((max-min)*rnd + min);
}
function randomBlock(){
    const keys = Object.keys(BlockTypes);
    const randomIndex = random(0,keys.length);
    const randomKey = keys[randomIndex];
    let randomBlockType = BlockTypes[randomKey];
    console.log(randomBlockType, randomKey, keys, BlockTypes);
    // randomBlockType = BlockTypes.I_block;

    let randomColor = random(0, Object.keys(BlockTypes).length);
    randomColor = randomIndex;
    let blck = new Block(randomBlockType, 0, Math.floor(N/2)-1, randomColor);
    nextBlockIdx = randomIndex;
    return blck;
}

let visibleFields = 0;
function updateGrid(){
    if(!grid) 
        resetGrid();
    else {
        for(let i=0; i<M; ++i){
            for(let j=0; j<N; ++j){
                grid[i][j].owner=null;
            }
        }
    }
    visibleFields = 0;
    blocks.forEach(function(block,index){
        block.fields.forEach(function(field,index){
            let i = field[0], j = field[1];
            if(i>=0) { // jer moze da bude iznad vrha ako se tek spawnuje;
                if(i>=M || j>=N) logBlock(block, "FAIL: ");
                grid[i][j].owner = block;
                visibleFields++;
            }
        })
    });

    // console.log(speed, level);

    if(!is_instant) {
        let prev_level = level;
        // let filledRatio = Math.min(visibleFields/(N*M) + speedOffset, 0.8);
        let filledRatio = Math.min(spawned*4/(N*M) + speedOffset, 0.8);
        speed = Math.floor((maxClock - clockRange*filledRatio)/clock)*clock;
        level = Math.ceil(filledRatio*3);
        if(prev_level!=level) updateInfo(0,0,1);
    }


    for(let i=0; i<M; ++i){
        for(let j=0; j<N; ++j){
            let str = `#grid .field[i='${i}'][j='${j}']`;
            let hField = $(str);

            if(grid[i][j].owner == null) {
                hField.css("background-image", 'none');
                hField.css("border","none");
                hField.css("background-color","");
            }
            else {
                let color = grid[i][j].owner.color;
                hField.css("background-image",`url("${images[color]}")`);
                hField.css("border","1px solid #111");
            }
        }
    }
    // return;
    if(state==State.Move) {
        let cpyBlock = new Block(movingBlock.type, 0, 0, movingBlock.color);
        cpyBlock.fields = copyArray(movingBlock.fields);
        let cnt=0;
        while(cpyBlock.moveDown(1,movingBlock)) cnt++;
        // console.log(cnt);
        cpyBlock.fields.forEach(function(field, idx){
            // console.log(field);
            // .css("border", "1px solid black")
            $(`#grid .field[i='${field[0]}'][j='${field[1]}']`).css("background-color","#8b8b8b");
        })
        // console.log("---");
    }
}

function checkFullRow(){
    let erased = true;
    let rows = 0;
    while(erased){
        erased = false;
        for(let i=M-1; i>=0; --i){
            let full = true;
            for(let j=0; j<N; ++j){
                if(!grid[i][j].owner) {
                    full = false;
                    break;
                }
            }
            if(full){
                linesCleared++;
                rows++;
                erased=true;
                
                // continue;
                // na svi gore povecaj y za 1
                // na svi owneri iz vrstu ukloni fieldovi sto su u tu vrstu
                // na svi gore setuj grid[i][j].owner = grid[i-1][j].owner
                
                done=[]
                for(let j=0; j<N; ++j){
                    let block = grid[i][j].owner;
                    if(!block || done.includes(block.ID)) continue;
                    done.push(block.ID);

                    // console.log("BLOK: ", block, "\nisecen.");
                    block.fields = block.fields.filter(item => item[0]/* + block.y*/ != i);
                }

                done=[];
                for(let ii=i-1; ii>=0; --ii){
                    for(let j=0; j<N; ++j) {
                        let block = grid[ii][j].owner;
                        if(!block || done.includes(block.ID)) continue;
                        done.push(block.ID);
                    
                        // console.log("BLOK: ", block, "\npomeren za jedan na dole.");
                        block.incByY(+1, i-1);
                    }
                }
                for(let ii=i; ii>=1; --ii){
                    for(let j=0; j<N; ++j){
                        grid[ii][j].owner = grid[ii-1][j].owner;
                        grid[ii-1][j].owner = null;
                    }
                }
            }
        }
    }
    if(rows) {
        score += 50*rows*level;
        updateInfo(1,1,0);
        // $("#score").addClass('light-up');
        // setTimeout(function() {
        //     $("#score").removeClass('light-up');
        // }, 3000);
    }
}

function resetGrid(){
    grid = [];
    for(let i=0; i<M; ++i) {
        grid.push([]);
        for(let j=0; j<N; ++j) {
            grid[i].push(new GridField());
        }
    }
}
function createTable() {

    resetGrid();
    let tabela = $("#grid");

    for(let i=0; i<M; ++i) {
        let row = $("<tr>");
        for(let j=0; j<N; ++j) {
            let cell = $("<td class='field'>");
            cell.attr("i",i).attr("j",j);
            row.append(cell);
        }
        tabela.append(row);
    }
}

function logBlock(block, optional=""){
    console.log(optional, "ID: ", block.ID, copyArray(block.fields));
}

function gameOver(){
    state = State.GameOver;
    let player = null;
    while( !/^[A-Za-z0-9]+$/.test(player=prompt("Enter your username (digits and letters only)")));
    if(player) {
        // let score = spawned * 50;
        players.push({
            username : player,
            score: score
        })
        localStorage.setItem("players",JSON.stringify(players));
    }

    // alert(player);
    // resetGame();
    clearInterval(thread1);
    window.location.href="tetris-rezultati.html";
}

function showNext(){
    let container = $("#grid-next");
    // alert(container.html());
    let image = images[nextBlockIdx];
    // alert(image);
    container.find(".field").css("background-image","none").css("border","");
    nextBlock.type.forEach(function(field, idx){
        let i=field[0], j=field[1];
        // alert(i,j);
        // alert(container.find(`.field[i=${i}][j=${j}]`));
        // console.log(`.field[i=${i}][j=${j}]`);
        container.find(`.field[i=${i}][j=${j}]`).css("background-image",`url("${image}")`)
                                                .css("border","2px solid #111");
    });
}
function spawnNew(){
    console.log("spawnowo,",spawned);
    movingBlock = nextBlock;
    nextBlock = randomBlock();
    
    if(!movingBlock.moveDown(0)){
        gameOver();
        // alert("Prvo nauci da igras pa onda");
    } else {
        spawned++;

        state = State.Move;
        keyboardLock = false;
        blocks.push(movingBlock);   
        showNext();
        // updateInfo(); ??? mozda ipak treba
    }
}

function tryRotation(block){
    let pivots = []
    if(block.type == BlockTypes.O) return;
    else if(block.type == BlockTypes.I) {
        pivots = [block.fields[0], block.fields[1]];
    } else {
        pivots = [block.fields[0]];
    }

    // alert("MENJANJE");
    let rotated = new Block(block.type, 0, 0, block.color);
    // logBlock(rotated);
    // console.log(rotated);
    // console.log(copyArray(block.fields));
    // rotated.fields = copyArray(block.fields);
    for(let i=0; i<pivots.length; ++i){
        rotated.fields = copyArray(block.fields);
        let pivot = pivots[i];

        for(let t=0; t<2; ++t){
            for(let j=0; j<4; ++j){
                let rField = Block.rotateField(rotated.fields[j], pivot, 2*t-1);
                rotated.fields[j] = rField;
            }
            // console.log(copyArray(rotated.fields));
    
            if(rotated.moveDown(0, block)) {
                // alert("POKUSAJ"+t);
                // iskopiraj polja
                block.fields = rotated.fields;
                // alert("USPEO");
                return;
            }
        }
    }
}

let movingBlock = null;
let nextBlock = null;
let nextBlockIdx = null;

let thread1 = null;
let state = State.Suspend;
let keyboardLock = false;

let ticks = 0;
let clock = 10;
let speed = null;
let minClock = 100;
let maxClock = 500;
let clockRange = maxClock - minClock;
let speedOffset;

let spawned = 0;
let linesCleared = 0;
let score = 0;
let level = 0;


function updateInfo(_score=false, _lines=false, _level=false){
    // $("#score").html(score);
    // $("#lines").html(linesCleared);
    // $("#level").html(level);

    if(_score) {
        $("#score").html(score).addClass("light-up");
    }
    if(_lines) {
        $("#lines").html(linesCleared).addClass("light-up");
    }
    if(_level) {
        $("#level").html(level).addClass("light-up");
    }

    setTimeout(function() {
        if(_score) {
            $("#score").removeClass("light-up");
        }
        if(_lines) {
            $("#lines").removeClass("light-up");
        }
        if(_level) {
            $("#level").removeClass("light-up");
        }
    }, 1500);

}
function resetGame(){
    ticks = 0;
    speed = null;
    spawned = 0;
    state = State.Suspend;
    score = 0;
    linesCleared = 0;
    nextBlock = movingBlock = null;
    if(thread1) {
        clearInterval(thread1);
        thread1 = null;
    }
    keyboardLock = false;
    blocks = [];
    // resetGrid();
    updateGrid();
    $("#kill").html("PLAY").click();
    updateInfo(1,1,1);
    // $("#speed").val(500);
}
function startGame(){

    fetchSpeed();
    speed = minClock;

    nextBlock = randomBlock();
    spawnNew();
    updateGrid();

    thread1 = setInterval(function(){
        ticks += clock;
        // console.log(speed);
        if(ticks%speed) return;
        console.log(speed);
        if(state==State.Suspend) return;
        if(state==State.Move) {
            keyboardLock = true;
            if(!movingBlock.moveDown()){
                // stigo najdublje
                checkFullRow();
                spawnNew();
            }else keyboardLock = false;
        }
        updateGrid();
        instant_off();
    },clock);
}
function fetchPlayers() {
    let storage = localStorage.getItem("players");
    if(!storage){
        localStorage.setItem("players", JSON.stringify(players));
    } else {
        players = JSON.parse(storage);
    }
}
function calcSpeed(){
    
}
function fetchSpeed(){
    level = localStorage.getItem("chosen-level");
    if(!level) level = 2;
    else level = parseInt(level);

    speedOffset = (level-1)/3;
    updateGrid();
}
function fetchShapes(){
    let shapes = [];
    const allKeys = Object.keys(BlockTypes);
    let chosenKeys = localStorage.getItem("chosen-shapes");
    if(!chosenKeys) return;

    let newImages = []
    chosenKeys = chosenKeys.split(",");
    allKeys.forEach(function(key, idx){
        if(!chosenKeys.includes(key)) delete BlockTypes[key];
        else newImages.push(images[idx]);
    })
    images = newImages;
}

var mouse_ctrl = false;
var keyboard_ctrl = true;
function fetchControls() {
    let controls = localStorage.getItem("controls");
    console.log(controls);
    if(controls) {
        controls = JSON.parse(controls);
        console.log(controls);
        mouse_ctrl = controls.mouse;
        keyboard_ctrl = controls.keyboard;

        console.log("kontrole", mouse_ctrl, keyboard_ctrl);

        if(!mouse_ctrl && !keyboard_ctrl) keyboard_ctrl=true;
    }
}

function confirmExit(){
    return confirm("Are you sure you want to exit the game and lose the score?");
}

let old_speed = null;
let is_instant = false;
function instant_on() {
    // return;
    if(is_instant) return;
    old_speed = speed;
    speed = clock;
    // console.log(speed);
    is_instant = true;
}
function instant_off() {
    if(!is_instant) return;
    is_instant = false;
    if(old_speed) speed = old_speed;
}
function placeImmediately() {
    keyboardLock = true;
    while(movingBlock.moveDown(1));
    instant_on();
}

let mouseTicks = 0;
$(document).ready(function(){

    // $("#speed").hide();

    fetchPlayers();
    fetchShapes();
    fetchControls();

    for(let i=0; i<3; ++i) {
        let row = $("<tr></tr>");
        for(let j=0; j<4; ++j) {
            let td = $("<td></td>");
            td.attr("i",i-1).attr("j",j).attr("class","field");
            td.css("border","none");
            row.append(td);
        }
        $("#grid-next").append(row);
    }
        
    resetGame();
    
    createTable();
    startGame();


    $("#kill").click(function(){
        if(state!=State.Suspend || keyboardLock) {
            state=State.Suspend;
            $("#kill").html("PLAY");
        }
        else {
            if(!thread1){
                startGame();
            } else {
                state = State.Move;
            }
            $("#kill").html("STOP");    
        }
    });
    if(mouse_ctrl) {
        $("#container-grid").mousemove(function(event){
            mouseTicks++;
            // if(mouseTicks%5) return;
            if(state==State.Move && !keyboardLock && movingBlock) {
                let mouseX = (event.pageX - $(this).offset().left)/30;
                // console.log(mouseX, $(this).offset().left);
                for(let i=0; i<1; ++i) {
                    let dist = movingBlock.fields[0][1] - mouseX;
                    if(dist>=-1 && dist<=1) break;
                    if(dist>1) movingBlock.moveLeft();
                    else movingBlock.moveRight();
                }
                // else {
                //     for(let i=0; i<5 && movingBlock.fields[0][1] < mouseX; ++i) movingBlock.moveRight();
                // } 
                updateGrid();
                // movingBlock.moveRight();
            }
        });

        $(window).on('wheel', function(event) {
            if(state!=State.Move || keyboardLock) return;
            if (event.originalEvent.deltaY > 0) {
                movingBlock.moveDown(1);
                instant_on();
            }
            else {
                tryRotation(movingBlock);
                updateGrid();
            }
        });

        $(document).mousedown(function(event) {
            if(state!=State.Move || keyboardLock) return;
    
            if(event.which == 1) {
                placeImmediately();
            } else if(event.which == 3) {
                tryRotation(movingBlock);
            }
    
            updateGrid();
        });

        $(document).on("contextmenu", function(e) {
            e.preventDefault();
        });
        
    }
    $(document).keydown(function(event){
        let code = event.which;
        if(code === 80){
            $("#kill").click();
            return;
        };
        if(code === 82) {
            if(confirmExit()){
                resetGame();
            }
        } else if (code==72) {
            if(confirmExit()) {
                clearInterval(thread1);
                window.location.href = "tetris-uputstvo.html";
            }
        }
        
        let change=true;
        if(state!=State.Move || keyboardLock || !keyboard_ctrl) return;
        if(code === 37){
            movingBlock.moveLeft();
        }
        else if(code === 38){
            tryRotation(movingBlock);
        }
        else if(code === 39){
            movingBlock.moveRight();
        }
        else if(code === 40){
            movingBlock.moveDown();
        }
        else if(code === 32){
            placeImmediately();
        }
        else change = false;
        
        if(change) updateGrid();
    });

    

})