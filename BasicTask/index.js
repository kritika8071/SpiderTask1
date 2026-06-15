const inputBox = document.querySelector(".inputBox");
const scoreBoard = document.querySelector(".scoreBoard");
const submitBtn = document.querySelector("#submitBtn");
const exitBtn = document.querySelector("#exitBtn");
const nextRoundBtn = document.querySelector("#nextRoundBtn");
let playerNumber;
let botNumber;
let spiderNumber;
let roundOver = false;
let roundNumber = 1;
let winner;
let playerDiff;
let botDiff;
let gameOver = false;
let inRange = false;

if(!gameOver){    
    submitBtn.addEventListener("click", play);
    nextRoundBtn.addEventListener("click", ()=>{
        roundNumber++;
        roundOver = false;
        document.querySelector("#numberBox").value = "";
        changeDisplays();
    });
    exitBtn.addEventListener("click", exitGame)
}

function changeScoreboard(){
    document.querySelector("#roundNo").innerHTML = `<div class="row">
                                                        <span class="label">Round No:</span>
                                                        <span class="value">${roundNumber}</span>
                                                    </div>`;
    document.querySelector("#playerGuess").innerHTML = `<div class="row">
                                                            <span class="label">Player's Guess:</span>
                                                            <span class="value">${playerNumber}</span>
                                                        </div>`;
    document.querySelector("#botGuess").innerHTML = `<div class="row">
                                                        <span class="label">Bot's Guess:</span>
                                                        <span class="value">${botNumber}</span>
                                                    </div>`;
    document.querySelector("#targetNumber").innerHTML = `<div class="row">
                                                            <span class="label">Target Number:</span>
                                                            <span class="value">${spiderNumber}</span>
                                                        </div>`;
    document.querySelector("#winner").textContent = `${winner} wins!!`;
}

function checkWinner(){
    if(playerDiff > botDiff)
        winner = "Player";
    else if(playerDiff < botDiff)
        winner = "Bot";
    else
        winner = "tie!";
}

function changeDisplays(){
    if(roundOver){
        inputBox.style.display = "none";
        scoreBoard.style.display = "block";
    }
    else{
        inputBox.style.display = "block";
        scoreBoard.style.display = "none";
    }
}

function play(){
    if(roundOver == false){
        playerNumber = Number(document.querySelector("#numberBox").value);
        if(!Number.isInteger(playerNumber)||playerNumber<0||playerNumber>100){
            alert("Please enter a whole number between 0 and 100!");
            document.querySelector("#numberBox").value = "";
            return;
        }
        botNumber = Math.floor(Math.random()*101);
        spiderNumber = Math.floor(((playerNumber+botNumber)/2)*0.8);
        playerDiff = Math.abs(spiderNumber - playerNumber);
        botDiff = Math.abs(spiderNumber - botNumber);
        checkWinner();
        roundOver = true;
        changeScoreboard();
        changeDisplays();
    }
}

function exitGame(){
    roundOver = false;
    roundNumber = 1;
    changeDisplays();
}