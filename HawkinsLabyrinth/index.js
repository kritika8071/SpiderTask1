const gameboard = document.querySelector(".container");
const spider = document.querySelector("#spider");
const dice = document.querySelector("#dice");
const up = document.querySelector("#top");
const down = document.querySelector("#bottom");
const left = document.querySelector("#left");
const right = document.querySelector("#right");
const vecna = document.querySelector("#vecnaHealth");
const player = document.querySelector("#playerHealth");
const finalText = document.querySelector("#winner");
const score = document.querySelector("#score");
let playerHealth = 150;
let vecnaHealth = 5;
let gameOver = false;
let diceNumber;
let exitCell;
let winner;
let turnNumber = 1;
let currentCell;
let timer = null;
let elapsedTime = 0;
let startTime;
let currentTime;
let zone = [true, false];
let grid = [];
let diceState = true;
let keys = {
    up: false,
    down: false, 
    left: false,
    right: false
};
let cellState = {
    up: false,
    down: false, 
    left: false,
    right: false
};

function startTimer(){
    startTime = Date.now();
    timer = setInterval(update, 1000);
}

function stopTimer(){
    clearInterval(timer);
}

function update(){
    currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    let seconds = Math.floor(elapsedTime/1000);
    vecnaHealth = 5 + seconds;
    vecna.textContent = `Vecna's Health: ${vecnaHealth}`;
}

function changePlayerHealth(cell){
    if(!cell.safeZone){
        playerHealth -= 15;
        player.textContent = `Player's Health: ${playerHealth}`;
    }
}

function moveSpider(cell){
    const rect = cell.getBoundingClientRect();
    const x = (rect.left + rect.width/6);
    const y = (rect.top+rect.height/6);
    spider.style.left = `${x}px`;
    spider.style.top = `${y}px`;
}

function rollDice(){
    if(diceState){
        diceNumber = Math.floor(Math.random()*10 + 1);
        dice.textContent = diceNumber;
        diceState = false;
    }
}

function unlockCells(cell){

    cellState = {up: false, down: false, left: false, right: false};

    if(cell.row>0 && grid[cell.row-1][cell.column].unlockingReqNo <= diceNumber)
        cellState.up = true;
    if(cell.row<4 && grid[cell.row+1][cell.column].unlockingReqNo <= diceNumber)
        cellState.down = true;
    if(cell.column>0 && grid[cell.row][cell.column-1].unlockingReqNo <= diceNumber)
        cellState.left = true;
    if(cell.column<4 && grid[cell.row][cell.column+1].unlockingReqNo <= diceNumber)
        cellState.right = true;
        const canMove = cellState.up || cellState.down || cellState.left || cellState.right;
    if (!canMove) {
        diceState = true;
    }
}

function movePlayer(cell){

    let moved = false;

    if(cellState.up && keys.up){
        currentCell = grid[cell.row-1][cell.column];
        moved = true;
    }
    if(cellState.down && keys.down){
        currentCell = grid[cell.row+1][cell.column];
        moved = true;
    }
    if(cellState.left && keys.left){
        currentCell = grid[cell.row][cell.column-1];
        moved = true;
    }
    if(cellState.right && keys.right){
        currentCell = grid[cell.row][cell.column+1];
        moved = true;
    }
    if(moved){
        moveSpider(currentCell.element);
        currentCell.visited = true;
        currentCell.element.classList.remove("hidden");
        if(currentCell.safeZone){
            currentCell.element.classList.add("real-world");
        }
        else{
            currentCell.element.classList.add("upside-down");
        }
        changePlayerHealth(currentCell);
        cellState = { up: false, down: false, left: false, right: false };
        keys = { up: false, down: false, left: false, right: false };
        diceState = true;
    }
}

function updateUnlockNos(cell){
    if(cell.row!=0)
        up.textContent = `${grid[cell.row-1][cell.column].unlockingReqNo}`;
    else
        up.textContent = "";
    if(cell.row!=4)
        down.textContent = `${grid[cell.row+1][cell.column].unlockingReqNo}`;
    else
        down.textContent = "";
    if(cell.column!=0)
        left.textContent = `${grid[cell.row][cell.column-1].unlockingReqNo}`;
    else
        left.textContent = "";
    if(cell.column!=4)
        right.textContent = `${grid[cell.row][cell.column+1].unlockingReqNo}`;
    else
        right.textContent = "";
}

function createGrid() {
  for (let j = 0; j < 5; j++) {
    let rowGrid = [];
    for (let i = 0; i < 5; i++) {
      rowGrid.push({
        unlockingReqNo: Math.floor(Math.random() * 10 + 1),
        safeZone: zone[Math.floor(Math.random() * 2)],
        element: null,
        row: j,
        column: i,
        visited: false
      });
    }
    grid.push(rowGrid);
  }
}

function showGrid(){
    for(let i=0; i<5; i++){
        for(let j=0; j<5; j++){
            const cell = document.createElement("div");
            grid[i][j].element = cell;
            cell.classList.add("cell");
            cell.classList.add("hidden");
            gameboard.append(cell);
        }
    }
}

function generateExitDoor(){
    let randomRow, randomCol;
    do{
        randomRow = Math.floor(Math.random()*5);
        randomCol = Math.floor(Math.random()*5);
    }
    while(randomRow==4 && randomCol == 4);
    exitCell = grid[randomRow][randomCol];
}

function checkExit(cell){
    if(cell.row == exitCell.row && cell.column == exitCell.column){
        gameOver = true;
        stopTimer();
        if(playerHealth > vecnaHealth){
            winner = "player"
        }
        else{
            winner = "vecna";
        }
        showGameOverScreen();
    }
    if(vecnaHealth > playerHealth){
        gameOver = true;
        stopTimer();
        winner = "vecna";
        showGameOverScreen();
    }
}

function showGameOverScreen(){
    document.querySelector(".game").style.display = "none";
    document.querySelector(".gameOverScreen").style.display = "flex"
    if(winner == "player"){
        finalText.textContent = "YOU CLOSED THE GATE!";
    }
    if(winner == "vecna"){
        finalText.textContent = "VECNA CLAIM HAWKINS!"
    }
    score.textContent = `SCORE: ${playerHealth - vecnaHealth}`;
}

window.addEventListener("resize", () => {
    if(currentCell){
        moveSpider(currentCell.element);
    }
});

window.addEventListener("keydown", (e)=>{
    if(e.key == "ArrowUp")
        keys.up = true;
    if(e.key == "ArrowDown")
        keys.down = true;
    if(e.key == "ArrowLeft")
        keys.left = true;
    if(e.key == "ArrowRight")
        keys.right = true;
    if(!diceState) movePlayer(currentCell);
});

window.addEventListener("keyup", (e) => {
    if(e.key === "ArrowUp")
        keys.up = false;
    if(e.key === "ArrowLeft")
        keys.left = false;
    if(e.key === "ArrowDown")
        keys.down = false;
    if(e.key === "ArrowRight")
        keys.right = false;
});

dice.addEventListener("click", ()=>{
    if(!gameOver){
        if(turnNumber == 1){
            startTimer();
        }
        rollDice();
        updateUnlockNos(currentCell);
        unlockCells(currentCell);
        movePlayer(currentCell);
        checkExit(currentCell);
        turnNumber++;        
    }

});

// These three functions should only be called once
createGrid();
showGrid();
generateExitDoor();
currentCell = grid[4][4];
currentCell.visited = true;
currentCell.element.classList.remove("hidden");
if(currentCell.safeZone){
    currentCell.element.classList.add("real-world");
}
else{
    currentCell.element.classList.add("upside-down");
}
moveSpider(currentCell.element);
