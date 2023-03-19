let canvas=document.querySelector("canvas");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;


let pencilColor=document.querySelector(".pencil-color-cont");
let pencilWidthElem=document.querySelector(".pencil-width");
let eraserWidthElem=document.querySelector(".eraser-width");
let download=document.querySelector(".download");
let redo=document.querySelector(".redo");
let undo=document.querySelector(".undo");

let undoRedoTracker=[];
let track=0;

let penColor="red";
let eraserColor="white";
let penWidth=pencilWidthElem.value;
let eraserWidth=eraserWidthElem.value;

//console.log(pencilColor.children.length);

let mouseDown=false;

let tool=canvas.getContext("2d");
tool.clearRect(0, 0, canvas.width, canvas.height);
// tool -> API to draw graphics

tool.strokeStyle=penColor;
tool.lineWidth=penWidth;

// tool.beginPath(); //new graphic (path)
// tool.moveTo(10,10); //start point
// tool.lineTo(100,100); //end point
// tool.stroke(); //to fill color

// tool.strokeStyle="red";
// tool.beginPath();
// tool.moveTo(4,9);
// tool.lineTo(200,250);
// tool.stroke();


//mousedown -> start new path, mousemove -> path fill
canvas.addEventListener("mousedown",(e)=>{
    mouseDown=true;
    // beginPath({
    //     x: e.clientX,
    //     y: e.clientY
    // })
    let data={
        x: e.clientX,
        y: e.clientY
    }
    beginPath(data);
    socket.emit("beginPath",data);
})


canvas.addEventListener("mousemove",(e)=>{
    if(mouseDown){
    let data={
        x: e.clientX,
        y:e.clientY,
        color: eraserFlag ? eraserColor : penColor,
        width : eraserFlag ? eraserWidth : penWidth
    }
    drawStroke(data);
    socket.emit("drawStroke",data);
    }
})

canvas.addEventListener("mouseup",(e)=>{
    mouseDown=false;

    let url=canvas.toDataURL();
    undoRedoTracker.push(url);
    track=undoRedoTracker.length-1;
})


undo.addEventListener("click",(e)=>{
    if(track>0){
        track--;
    }
    let data={
        trackValue:track,
        undoRedoTracker
    }
    undoRedoCanvas(data);
    socket.emit("redoUndo",data);
})
redo.addEventListener("click",(e)=>{
    if(track<undoRedoTracker.length-1){
        track++;
    }
    let data={
        trackValue:track,
        undoRedoTracker
    }
    undoRedoCanvas(data);
    socket.emit("redoUndo",data);
})

function undoRedoCanvas(trackObj){
    track=trackObj.trackValue;
    undoRedoTracker=trackObj.undoRedoTracker;

    let url=undoRedoTracker[track];
    let img=new Image();     //new image reference element
    img.src=url;
    canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
    img.onload=(e)=>{
        tool.drawImage(img,0,0,canvas.width,canvas.height);
    }
}


function beginPath(e){
    tool.beginPath();
    tool.moveTo(e.clientX,e.clientY);
}

function drawStroke(strokeObj){
    tool.strokeStyle=strokeObj.color;
    tool.lineWidth=strokeObj.width;
    tool.lineTo(strokeObj.x,strokeObj.y);
    tool.stroke();
}

for(let i=0;i<pencilColor.children.length;i++){
    pencilColor.children[i].addEventListener("click",(e)=>{
        let color=pencilColor.children[i].classList[0];
        penColor=color;
        tool.strokeStyle=penColor;

        pencilColor.children[i].classList.add("mark-outline");
        pencilColor.children[(i+1)%3].classList.remove("mark-outline");
        pencilColor.children[(i+2)%3].classList.remove("mark-outline");
    })
}

pencilWidthElem.addEventListener("change",(e)=>{
    penWidth=pencilWidthElem.value;
    tool.lineWidth=penWidth;
})

eraserWidthElem.addEventListener("change",(e)=>{
    eraserWidth=eraserWidthElem.value;
    tool.lineWidth=eraserWidth;
})

eraser.addEventListener("click",(e)=>{
    if(eraserFlag){
        tool.strokeStyle=eraserColor;
        tool.lineWidth=eraserWidth;
    }else{
        tool.strokeStyle=penColor;
        tool.lineWidth=penWidth
    }
})

pencil.addEventListener("click",(e)=>{
    tool.strokeStyle=penColor;
    tool.lineWidth=penWidth;
})

download.addEventListener("click",(e)=>{

    let url=canvas.toDataURL();

    let a=document.createElement("a");
    a.setAttribute("background","white");
    a.href=url;
    a.download="board.jpg";
    a.click();
})

socket.on("beginPath",(data)=>{
    beginPath(data);
})

socket.on("drawStroke",(data)=>{
    drawStroke(data);
})

socket.on("redoUndo",(data)=>{
    undoRedoCanvas(data);
})