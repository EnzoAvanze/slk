const videoElement = document.querySelector(".input_video");
const canvasElement = document.querySelector(".output_canvas");
const canvasCtx = canvasElement.getContext("2d");

const cursor = document.getElementById("cursor");

canvasElement.width = 1280;
canvasElement.height = 720;

let lastClick = 0;
let lastX = 0;

/* PERSONALIZAÇÃO */

const menu = document.getElementById("customMenu");
const startBtn = document.getElementById("startBtn");
const colorPicker = document.getElementById("handColor");
const sizePicker = document.getElementById("handSize");
const typePicker = document.getElementById("handType");

let handColor="#00ffff";
let handSize=30;
let handType="normal";

function updateCursor(){

cursor.style.width=handSize+"px";
cursor.style.height=handSize+"px";

if(handType==="ice"){

cursor.style.background="radial-gradient(circle,#aef,#7df,transparent)";
cursor.style.boxShadow=`
0 0 10px #aef,
0 0 20px #aef,
0 0 40px #aef`;

}else{

cursor.style.background=`radial-gradient(circle,${handColor},transparent)`;
cursor.style.boxShadow=`
0 0 10px ${handColor},
0 0 20px ${handColor},
0 0 40px ${handColor}`;

}

}

colorPicker.oninput=()=>{
handColor=colorPicker.value;
updateCursor();
}

sizePicker.oninput=()=>{
handSize=sizePicker.value;
updateCursor();
}

typePicker.onchange=()=>{
handType=typePicker.value;
updateCursor();
}

startBtn.onclick=()=>{
menu.style.display="none";
}

/* MEDIAPIPE */

const hands = new Hands({
locateFile:(file)=>{
return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}
});

hands.setOptions({
maxNumHands:1,
modelComplexity:1,
minDetectionConfidence:0.6,
minTrackingConfidence:0.6
});

hands.onResults(onResults);

function onResults(results){

document.querySelector(".loading").style.display="none";

canvasCtx.save();
canvasCtx.clearRect(0,0,canvasElement.width,canvasElement.height);

canvasCtx.drawImage(results.image,0,0,canvasElement.width,canvasElement.height);

if(results.multiHandLandmarks){

for(const landmarks of results.multiHandLandmarks){

let x=0;
let y=0;

landmarks.forEach(p=>{
x+=p.x;
y+=p.y;
});

x=(x/landmarks.length)*canvasElement.width;
y=(y/landmarks.length)*canvasElement.height;

canvasCtx.beginPath();
canvasCtx.arc(x,y,80,0,9*Math.PI);
canvasCtx.strokeStyle=handType==="ice" ? "#aef" : handColor;
canvasCtx.lineWidth=4;
canvasCtx.stroke();

/* CURSOR */

const finger = landmarks[8];

let cx=(1-finger.x)*window.innerWidth;
let cy=finger.y*window.innerHeight;

cursor.style.left=cx+"px";
cursor.style.top=cy+"px";

/* VIRAR PAGINA */

if(lastX!==0){

let movement=cx-lastX;

if(movement>120){
nextPage();
}

}

lastX=cx;

/* CLICK */

const thumb=landmarks[4];

const dx=thumb.x-finger.x;
const dy=thumb.y-finger.y;

const distance=Math.sqrt(dx*dx+dy*dy);

if(distance<0.05){

if(Date.now()-lastClick>800){

checkClick(cx,cy);

lastClick=Date.now();

}

}

}

}

canvasCtx.restore();

}

/* CLICK */

function checkClick(x,y){

const element=document.elementFromPoint(x,y);

if(!element) return;

if(element.id==="nextPageBtn"){
nextPage();
}

if(element.id==="iceScreen"){
breakIce();
}

}

/* PAGINAS */

function nextPage(){

const pages=document.querySelectorAll(".page");
const current=document.querySelector(".page.active");

let index=[...pages].indexOf(current);

if(index===pages.length-1){

document.getElementById("nextPageBtn").style.display="none";
return;

}

current.classList.remove("active");
pages[index+1].classList.add("active");

}

/* GELO */

let clicks=0;
const maxClicks=3;

const ice=document.getElementById("iceScreen");
const text=document.getElementById("iceText");

const crackCanvas=document.getElementById("crackCanvas");
const crackCtx=crackCanvas.getContext("2d");

crackCanvas.width=window.innerWidth;
crackCanvas.height=window.innerHeight;

function drawCrack(){

const cx=crackCanvas.width/2;
const cy=crackCanvas.height/2;

crackCtx.strokeStyle="white";
crackCtx.lineWidth=8;

crackCtx.beginPath();
crackCtx.moveTo(cx,cy);
crackCtx.lineTo(cx+Math.random()*600-300,cy+Math.random()*600-300);
crackCtx.stroke();

}

function breakIce(){

clicks++;

drawCrack();

text.innerText="Quebrando gelo ("+clicks+"/3)";

if(clicks>=maxClicks){

ice.style.transition="opacity 1s";
ice.style.opacity="0";

setTimeout(()=>{

ice.remove();

/* INTRODUÇÃO ABRINDO LIVRO */

document.getElementById("book").classList.add("show");

},1000);

}

}

/* CAMERA */

const camera=new Camera(videoElement,{
onFrame:async()=>{
await hands.send({image:videoElement});
},
width:1280,
height:720
});

camera.start();