const grid = document.getElementById("grid");

let score = 0;
let lives = 3;
let seconds = 0;
let paused = false;
let timer = null;
let currentLevel = "easy";

/* ======================
   PUZZLES
====================== */

const puzzles = {

easy: [
[5,3,0,0,7,0,0,0,0],
[6,0,0,1,9,5,0,0,0],
[0,9,8,0,0,0,0,6,0],
[8,0,0,0,6,0,0,0,3],
[4,0,0,8,0,3,0,0,1],
[7,0,0,0,2,0,0,0,6],
[0,6,0,0,0,0,2,8,0],
[0,0,0,4,1,9,0,0,5],
[0,0,0,0,8,0,0,7,9]
],

medium: [
[0,0,0,2,6,0,7,0,1],
[6,8,0,0,7,0,0,9,0],
[1,9,0,0,0,4,5,0,0],
[8,2,0,1,0,0,0,4,0],
[0,0,4,6,0,2,9,0,0],
[0,5,0,0,0,3,0,2,8],
[0,0,9,3,0,0,0,7,4],
[0,4,0,0,5,0,0,3,6],
[7,0,3,0,1,8,0,0,0]
],

hard: [
[0,0,0,0,0,0,0,1,2],
[0,0,0,0,0,7,0,0,0],
[0,0,1,0,9,0,0,0,0],
[0,0,0,0,0,0,4,0,0],
[0,0,0,7,0,2,0,0,0],
[0,0,8,0,0,0,0,0,0],
[0,0,0,0,3,0,5,0,0],
[0,0,0,6,0,0,0,0,0],
[2,7,0,0,0,0,0,0,0]
]
};

/* ======================
   CREATE BOARD
====================== */

function generateBoard(board){

grid.innerHTML = "";

for(let row=0; row<9; row++){

for(let col=0; col<9; col++){

const input =
document.createElement("input");

input.type = "text";
input.maxLength = 1;

if(board[row][col] !== 0){

input.value =
board[row][col];

input.disabled = true;
input.classList.add("locked");

}else{

input.addEventListener(
"input",
function(){

if(!/^[1-9]?$/
.test(this.value)){

this.value = "";
return;
}

if(this.value !== ""){

validateMove(
row,
col,
this
);
}

checkWin();
});
}

grid.appendChild(input);
}
}
}

/* ======================
   VALIDATE MOVE
====================== */

function validateMove(
row,
col,
cell
){

const num =
parseInt(cell.value);

const board =
getBoard();

board[row][col] = 0;

if(
isValidMove(
board,
row,
col,
num
)
){

cell.classList.remove(
"wrong"
);

score += 2;

}else{

cell.classList.add(
"wrong"
);

score -= 1;
lives--;

updateLives();

if(lives <= 0){

alert(
"💀 Game Over!"
);

disableBoard();

document
.getElementById(
"status"
)
.innerText =
"Game Over";
}
}

updateScore();
}

/* ======================
   SUDOKU RULES
====================== */

function isValidMove(
board,
row,
col,
num
){

for(let x=0;x<9;x++){

if(board[row][x]===num){
return false;
}
}

for(let x=0;x<9;x++){

if(board[x][col]===num){
return false;
}
}

const startRow =
Math.floor(row/3)*3;

const startCol =
Math.floor(col/3)*3;

for(let i=0;i<3;i++){

for(let j=0;j<3;j++){

if(
board[startRow+i]
[startCol+j]
=== num
){
return false;
}
}
}

return true;
}

/* ======================
   SOLVE BUTTON
====================== */

async function solveSudoku(){

try{

const response =
await fetch(
"/solve",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify({
board:getBoard()
})
}
);

const data =
await response.json();

if(data.solution){

const cells =
document.querySelectorAll(
"#grid input"
);

for(let i=0;i<81;i++){

const row =
Math.floor(i/9);

const col =
i%9;

cells[i].value =
data.solution[row][col];

cells[i].disabled =
true;
}

document
.getElementById(
"status"
)
.innerText =
"Solved";

alert(
"🎉 Sudoku Solved!"
);

}else{

alert(
"No solution found"
);
}

}catch(error){

console.error(error);

alert(
"Solver Error"
);
}
}

/* ======================
   GET BOARD
====================== */

function getBoard(){

const cells =
document.querySelectorAll(
"#grid input"
);

let board = [];

for(let row=0;
row<9;
row++){

let currentRow=[];

for(let col=0;
col<9;
col++){

const value =
cells[
row*9+col
].value;

currentRow.push(
value
?
parseInt(value)
:0
);
}

board.push(currentRow);
}

return board;
}

/* ======================
   TIMER
====================== */

function startTimer(){

if(timer){
clearInterval(timer);
}

timer =
setInterval(()=>{

if(paused) return;

seconds++;

const mins =
Math.floor(seconds/60);

const secs =
seconds%60;

document
.getElementById(
"timer"
)
.innerText =
`${mins}:${
secs<10
?'0':''
}${secs}`;

},1000);
}

function pauseTimer(){
paused=!paused;
}

/* ======================
   GAME FUNCTIONS
====================== */

function loadPuzzle(level){

currentLevel = level;

score = 0;
lives = 3;
seconds = 0;
paused = false;

updateScore();
updateLives();

document
.getElementById(
"status"
)
.innerText =
"Playing";

generateBoard(
puzzles[level]
);

startTimer();
}

function randomPuzzle(){

const levels =
["easy",
"medium",
"hard"];

const random =
levels[
Math.floor(
Math.random()*3
)
];

loadPuzzle(random);
}

function resetGrid(){

loadPuzzle(
currentLevel
);
}

function toggleTheme(){

document.body
.classList.toggle(
"dark"
);

const btn =
document
.getElementById(
"themeBtn"
);

btn.innerText =
document.body
.classList.contains(
"dark"
)
?
"☀ Light Mode"
:
"🌙 Dark Mode";
}

function updateScore(){

document
.getElementById(
"score"
)
.innerText =
score;
}

function updateLives(){

document
.getElementById(
"lives"
)
.innerText =
lives;
}

function disableBoard(){

document
.querySelectorAll(
"#grid input"
)
.forEach(cell=>{
cell.disabled=true;
});
}

function checkWin(){

const cells =
document.querySelectorAll(
"#grid input"
);

const won =
[...cells]
.every(
cell =>
cell.value !== ""
);

if(won && lives>0){

document
.getElementById(
"status"
)
.innerText =
"Completed";

alert(
"🏆 You Win!"
);
}
}

/* ======================
   START
====================== */

loadPuzzle("easy");