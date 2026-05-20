const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_STATE = {
    TITLE: 0,
    PLAY: 1,
    GAME_OVER: 2,
    SCORE_BOARD: 3,
    SCORE_ENTRY: 4,
};

Object.freeze(GAME_STATE); //makes immutable

let inputStates = {
    up: false,
    down: false,
    left: false,
    right: false,
    enter: false,
    space: false,
}

document.addEventListener("keydown",OnKeyboardDown);
document.addEventListener("keyup",OnKeyboardUp);
document.addEventListener("mousemove",mouseMoveHandler);


function mouseMoveHandler(e)
{
    const relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > wallLeft && relativeX < wallRight)
    {
        paddle.x = Math.max(wallLeft, Math.min(wallRight-paddle.w,relativeX-paddle.w*0.5));
    }
}

function OnKeyboardDown(e)
{
   if(e.key==="Up" || e.key=="ArrowUp")
    inputStates.up = true;

   if(e.key==="Down"  || e.key=="ArrowDown")
    inputStates.down = true;

   if(e.key==="Left" || e.key=="ArrowLeft")
    inputStates.left = true;

   if(e.key==="Right" || e.key=="ArrowRight")
   inputStates.right = true;

   if(e.key=="Return" || e.key=="Enter")
    inputStates.enter = true;

   if(e.key==" ")
    inputStates.space = true;

   //Can also do:
   //if(e.keyCode==37){}; etc
   //might be more precise.
}

function OnKeyboardUp(e)
{
    if(e.key==="Up"  || e.key=="ArrowUp")
       inputStates.up = false;

    if(e.key==="Down" || e.key=="ArrowDown")
        inputStates.down = false;

    if(e.key==="Left" || e.key=="ArrowLeft")
        inputStates.left = false;

    if(e.key==="Right" || e.key=="ArrowRight")
        inputStates.right = false;

    if(e.key=="Return" || e.key=="Enter")
        inputStates.enter = false;

    if(e.key==" ")
        inputStates.space = false;
}

//graphics functions
function DrawRectangle(x,y,w,h,color)
{
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    
}

function DrawLineRectangle(x,y,w,h,color,lineWidth)
{
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.rect(x,y,w,h);
    ctx.stroke();
    ctx.closePath();
}

function DrawLine(x1,y1,x2,y2,lineSize,color)
{
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineSize;
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.closePath();
}

function DrawCircle(x,y,r,color)
{
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.Pi*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

//Collision Detection
function CheckAABB(ax,ay,aw,ah,bx,by,bw,bh)
{
    return (ax+aw > bx && ax < bx+bw && ay+ah>by && ay<by+bh);
}

function CheckPointInRect(x,y,x2,y2,w,h)
{
    return (x > x2 && x < x2+w && y > y2 && y <y2+h);
}

function GetRandomInt(min,max)
{
    return min + (Math.floor(Math.random()*(max-min)));
}

const logoImg = new Image();
logoImg.src = "./game/assets/logo_small.png";
let titleVelY = 0;
//let titleY = 0;//-logoImg.height;


let gGame = {
    curGameState: GAME_STATE.TITLE,
    curLevel: 0,
    score: 0,
    lives: 3,
    ballCount: 0,
    destroyedBricks: 0,
    toNextBonusLife: 0
};

let paddle = {
    x: (canvas.width-30)/2,
    y: canvas.height-32,
    w: 64,
    h: 16
};

let scrollDisplay = {
    text: "",
    timer: 0,
    phase: 0,
    yPos: -20,
    isActive: false
};

let gCurrentTime = 0;
let timer = 0;
let lastFrameTime = 0;

let maxBrickCols = 10;
let maxBrickRows = 4;
const brickWidth = 32;
const brickHeight = 16;
const brickPadding = 0;
const screenOffsetX = 16;
const screenOffsetY = 16;

const NEXT_BONUS_LIFE = 500;

let maxLevels = 0;
const levels = []

//level 1
levels[maxLevels++] = [
    0,0,0,0,0,0,0,0,0,0,
    0,0,1,1,1,1,1,1,0,0,
    0,0,1,1,1,1,1,1,0,0,
    0,0,0,0,0,0,0,0,0,0,
  
];

levels[maxLevels++] = [
    0,0,2,2,2,2,2,2,0,0,
    0,0,1,1,1,1,1,1,0,0,
    0,0,1,1,3,3,1,1,0,0,
    0,0,0,0,0,0,0,0,0,0,
  
];

//level 2
levels[maxLevels++] = [
    0,1,2,1,2,1,2,1,2,0,
    0,2,1,2,1,2,1,2,1,0,
    0,1,2,1,2,1,2,1,2,0,
    0,0,0,0,0,0,1,0,0,0,
  
];

levels[maxLevels++] = [
    0,2,1,0,0,0,0,1,2,0,
    0,2,1,0,0,0,0,1,2,0,
    0,2,1,0,0,0,0,1,2,0,
    0,0,0,0,0,0,0,0,0,0,
  
];

const maxHighScores = 5;
const maxScoreName = 4;
let newName = [65,65,65,65];
let nameCurChar = 0;

let scoreBoard = [
    {name: "JIM",score: 15000},
    {name: "GAB",score: 6950},
    {name: "LISA",score: 3910},
    {name: "SAM",score: 1900},
    {name: "SUE",score: 800},
];

let brickCount = 0;
let bricks = [];

let balls = []; //might have multiple balls
let ballSpeedScale = 1;
let ballPenetration = false;

const POWERUP_TYPE = {
    SLOW_BALL: 0,
    FAST_BALL: 1,
    PENETRATION: 2,
    MULTI_BALL: 3,
    BONUS_LIFE: 4,
    BONUS_POINTS: 5,
    MAX_POWERUP_TYPE: 6
};

Object.freeze(POWERUP_TYPE);

const powerupSpeed = 240;
let powerupCount = 0;
let powerups = [];

const wallLeft = 16;
const wallTop = 16;
const wallRight = 336;

function NewPowerup(x,y,type)
{
    powerups[powerupCount++] = {
        x:x,
        y:y,
        w:10,
        h:10,
        color: "#e17c18", //Replace with texture later.
        type: type
    };
}

function RemovePowerup(index)
{
    //let ball = balls[index];
    if(index<powerupCount-1)
    {
        powerups[index] = powerups[powerupCount-1];
    }

    powerupCount--;
}

//take data from array and generate all bricks in level
function GenerateBricks(data)
{
    for(let r=0;r<maxBrickRows;r++)
    {
        for(let c=0;c<maxBrickCols;c++)
        {
            let brickType = data[r*maxBrickCols+c];
            if(!brickType)continue;
            let sx = c*(brickWidth+brickPadding)+screenOffsetX;
            let sy = r*(brickHeight+brickPadding)+screenOffsetY;

            if(brickType===1)
            {
                bricks[brickCount++] = {
                x: sx,
                y: sy,
                color: "#35c528",
                health: 1,
                isAlive: 1,
                brickType: brickType,
                value: 10,
                type: brickType
                }
            }
            else if(brickType===2)
            {
                bricks[brickCount++] = {
                x: sx,
                y: sy,
                color: "#eca115",
                health: 2,
                isAlive: 1,
                brickType: brickType,
                value: 20,
                type: brickType
                }
            }
            else if(brickType===3) //indestructable brick
            {
                bricks[brickCount++] = {
                x: sx,
                y: sy,
                color: "#3b362b",
                health: 1,
                isAlive: 1,
                brickType: brickType,
                value: 0,
                type: brickType
                }
                gGame.destroyedBricks++; //to compensate for the indestructability.
            }
            
        }
    }
}


function DrawBricks()
{
    for(let i=0;i<brickCount;i++)
    {
        let b = bricks[i];
        if(!b.isAlive)continue;
        DrawRectangle(b.x,b.y,brickWidth,brickHeight,b.color);
        DrawLineRectangle(b.x,b.y,brickWidth,brickHeight,"#000000",1);
    }
}

function BallBounce(ball,x,y,w,h)
{
    if(ball.x+2 < x && ball.dx>0)
    {
        ball.dx = -ball.dx;
        ball.x = x-ball.radius;
    }else if(ball.x+ball.radius+2 > x+w && ball.dx<0)
    {
        ball.dx = -ball.dx;
        ball.x = x+w;
    }

    if(ball.y+2 < y && ball.dy>0)
    {
        ball.dy = -ball.dy;
        ball.y = y-ball.radius;
    }else if(ball.y+ball.radius+2 > y+h && ball.dy<0)
    {
        ball.dy = -ball.dy;
        ball.y = y+h;
    }
}

function CheckCollisions()
{
    
    //Ball Collisions
    for(let i=0;i<gGame.ballCount;i++)
    {

        let ball = balls[i];

        //brick collisions
        for(let i=0;i<brickCount;i++)
        {
            let b = bricks[i];
            if(!b.isAlive)continue;
            
            if(CheckAABB(ball.x,ball.y,ball.radius,ball.radius,b.x,b.y,brickWidth,brickHeight))
            {
                if(b.type===3) //indestructable type
                {
                    BallBounce(ball,b.x,b.y,brickWidth,brickHeight);
                    continue;
                }

                if(ballPenetration)
                    b.health -=10;
                else
                    b.health--;
                
                if(b.health<=0)
                {
                    b.isAlive=false;
                    GetScore(b.value);
                    gGame.destroyedBricks++;

                    let roll = GetRandomInt(0,10);
                    if(roll > 3)
                    {
                        roll = GetRandomInt(0,POWERUP_TYPE.MAX_POWERUP_TYPE);
                        NewPowerup(b.x+brickWidth*0.5,b.y+brickHeight*0.5,roll);
                    }
                }

                //handle ball bounce
                if(ballPenetration===false)
                    BallBounce(ball,b.x,b.y,brickWidth,brickHeight);
            }
            
        }

        //paddle
        if(CheckAABB(ball.x,ball.y,ball.radius,ball.radius,paddle.x,paddle.y,paddle.w,paddle.h))
        {
            BallBounce(ball,paddle.x,paddle.y,paddle.w,paddle.h);
        }

        //walls
        if(ball.x < wallLeft)
        {
            ball.x = wallLeft;
            ball.dx = -ball.dx;
        }
            
        if(ball.x+ball.radius>wallRight)
        {
            ball.x = wallRight-ball.radius;
            ball.dx = -ball.dx;
        }
            
        if(ball.y < wallTop)
        {
            ball.y = wallTop;
            ball.dy = -ball.dy;
        }
            
        if(ball.y>canvas.height)
        {
            RemoveBall(i);
            i--;
        }
            
    }

    //Powerups
    for(let i=0;i<powerupCount;i++)
    {
        let p = powerups[i];

        if(CheckAABB(p.x,p.y,p.w,p.h,paddle.x,paddle.y,paddle.w,paddle.h))
        {
            GetPowerup(p.type);
            RemovePowerup(i);
            i--; //if removed, need to go back one
        }

        if(p.y > canvas.height)
        {
            RemovePowerup(i);
            i--;
        }
    }
}

function NewBall(x,y)
{
    balls[gGame.ballCount++] = {
        x: x,
        y: y,
        dx: 0,
        dy: 0,
        radius: 10,
        launched: false
    }
}

function RemoveBall(index)
{
    //let ball = balls[index];
    if(index<gGame.ballCount-1)
    {
        balls[index] = balls[gGame.ballCount-1];
    }

    gGame.ballCount--;
}

function DrawBalls()
{
    for(let i=0;i<gGame.ballCount;i++)
    {
        let b = balls[i];
        DrawRectangle(b.x,b.y,b.radius,b.radius,"#ff0de7");
    }
        
}

function DrawHud()
{
    let hudX = 352;
    let hudY = 0;
    let width = 128;
    let height = canvas.height;
    DrawRectangle(hudX,hudY,width,height,"#000000");

    let y = hudY + 32;
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${gGame.score}`,hudX+16,y);
    y+=30;
    ctx.fillText(`Lives: ${gGame.lives}`,hudX+16,y);
    y+=30;
    ctx.fillText(`Level: ${gGame.curLevel+1}`,hudX+16,y);
}

function NewGame()
{
    gGame.ballCount = 0;
    gGame.curLevel = 0;
    gGame.score = 0;
    gGame.lives = 3;
    gGame.toNextBonusLife = NEXT_BONUS_LIFE;
    StartLevel();
}

function GetScore(amount)
{
    gGame.score += amount;
    if(gGame.score >= gGame.toNextBonusLife)
    {
        gGame.lives++;
        gGame.toNextBonusLife += gGame.toNextBonusLife*2;
    }
}

function GetPowerup(powerupType)
{
    console.log("Got powerup: "+powerupType);
    switch(powerupType)
    {
        case POWERUP_TYPE.SLOW_BALL: //slow ball
            ballSpeedScale = 0.5;
            break;
        case POWERUP_TYPE.FAST_BALL: //fast ball
            ballSpeedScale = 1.5;
            break;
        case POWERUP_TYPE.PENETRATION:
            ballPenetration = true;
            console.log("Got ball penetration");
            break;
        case POWERUP_TYPE.MULTI_BALL:
            for(let i=0;i<2;i++)
            {
                NewBall(balls[0].x+5*(i+1),balls[0].y+3*(i+1));
                balls[gGame.ballCount-1].launched = true;
                balls[gGame.ballCount-1].dx = balls[0].dx;
                balls[gGame.ballCount-1].dy = balls[0].dy;
            }
            break;
        case POWERUP_TYPE.BONUS_LIFE:
            gGame.lives++;
            break;
        case POWERUP_TYPE.BONUS_POINTS:
            GetScore(200);
            break;
    }
}

function DrawPowerups()
{
    for(let i=0;i<powerupCount;i++)
        DrawRectangle(powerups[i].x,powerups[i].y,powerups[i].w,powerups[i].h,powerups[i].color);
}

function ResetLevel()
{
    paddle.x = wallRight/2-paddle.w/2;
    paddle.y = canvas.height-48;

    gGame.ballCount = 0;
    ballSpeedScale = 1;
    ballPenetration = false;
    NewBall(paddle.x+10,paddle.y);

    balls[0].y -= balls[0].radius;

    SetScrollDisplay(`Level: ${gGame.curLevel+1}`);

    powerupCount=0;

}

function StartLevel()
{
    brickCount = 0;
    gGame.destroyedBricks = 0;
    GenerateBricks(levels[gGame.curLevel]);
    console.log("Bricks generated " + brickCount);
    
    ResetLevel();
}

function ToNextLevel()
{
    gGame.curLevel = (gGame.curLevel+1)%maxLevels;
    StartLevel();
}

function Die()
{
    if(--gGame.lives<=0)
    {
        gGame.curGameState=GAME_STATE.GAME_OVER;
        return;
    }

    ResetLevel();
}

function SetScrollDisplay(text)
{
    scrollDisplay.text = text;
    scrollDisplay.yPos = -20;
    scrollDisplay.phase = 0;
    scrollDisplay.timer = 0;
    scrollDisplay.isActive = true;
}

function UpdateScrollDisplay(dt)
{
    if(scrollDisplay.timer===0)
    {
        scrollDisplay.yPos+=280*dt;
        if(scrollDisplay.phase===0 && scrollDisplay.yPos>canvas.height*0.5)
        {
            scrollDisplay.timer += 60;
            scrollDisplay.phase++;
        }
        else if(scrollDisplay.phase===1 && scrollDisplay.yPos>canvas.height)
        {
            scrollDisplay.phase++; //finished
            scrollDisplay.isActive = false;
            if(gGame.destroyedBricks >= brickCount)
                ToNextLevel();
            
        }
    }
    else
    {
        scrollDisplay.timer--;
    }
    
}

function UpdatePlay(dt)
{
    if(timer>0)
    {
        if(--timer<=0)
        {
            if(gGame.ballCount<=0)
            {
                Die();
            }
            
        }
        return;
    }

    if(scrollDisplay.isActive)
    {
        UpdateScrollDisplay(dt);
        return;
    }
    //INPUT
    let speed = 340;
    if(inputStates.right)
    {
        paddle.x = Math.min(paddle.x + speed*dt,wallRight-paddle.w);
    }
    else if(inputStates.left)
    {
        paddle.x = Math.max(paddle.x - speed*dt,wallLeft);
    }

    //Powerup test
    if(inputStates.enter)
    {
        GetPowerup(POWERUP_TYPE.PENETRATION);
        inputStates.enter=false;
    }
   
    //Update balls
    for(let i=0;i<gGame.ballCount;i++)
    {
        let b = balls[i];
        if(!b.launched)
        {
            b.x = paddle.x+10;
            b.y = paddle.y-b.radius;
            if(inputStates.space)
            {
                console.log("Ball launched!");
                b.launched = true;
                b.dx = -220;
                b.dy = -190;
            }
            
        }
        else
        {
            b.x += b.dx * dt * ballSpeedScale;
            b.y += b.dy * dt * ballSpeedScale;
        }

    }

    //Update Powerups
    for(let i=0;i<powerupCount;i++)
        powerups[i].y += powerupSpeed*dt;
    
    CheckCollisions();

    if(gGame.destroyedBricks >= brickCount)
    {
        SetScrollDisplay("GOOD JOB!!");
    }

    if(gGame.ballCount<=0)
    {
        timer = 30;
    }

    
}

function DrawPlay()
{
    //play area
    DrawRectangle(16,16,320,304,"#3239cc");
    //walls
    let wallColor = "#808080";
    DrawRectangle(0,0,16,canvas.height,wallColor); //left
    DrawRectangle(0,0,352,16,wallColor); //top
    DrawRectangle(336,16,16,canvas.height,wallColor); //right

    //stuff
    DrawPowerups();
    DrawBricks();
    DrawRectangle(paddle.x,paddle.y,paddle.w,paddle.h,"#FFFF00");
    DrawLineRectangle(paddle.x,paddle.y,paddle.w,paddle.h,"#000000",2);
    DrawBalls();
    DrawHud();

    if(scrollDisplay.isActive)
    {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(scrollDisplay.text,canvas.width*0.5-50,scrollDisplay.yPos);    
    }
    
}

function UpdateGameOver(dt)
{
    //UPDATE
    if(inputStates.enter)
    {
         if(gGame.score>scoreBoard[maxHighScores-1].score)
            gGame.curGameState = GAME_STATE.SCORE_ENTRY;
        else
            gGame.curGameState = GAME_STATE.TITLE;
           
        inputStates.enter = false;
    }
        
    //RENDER
    DrawRectangle(0,0,canvas.width,canvas.height,"#9e575b");

    ctx.font = "16px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("GAME OVER",canvas.width/2-30,canvas.height/2);
    ctx.fillText(`Your Score: ${gGame.score}`,canvas.width/2-30,canvas.height/2+20);
    
}

function UpdateTitle(dt)
{
    //UPDATE
    if(inputStates.enter)
    {
        NewGame();
        gGame.curGameState = GAME_STATE.PLAY;
        inputStates.enter = false;
    }
       
    //RENDER
    DrawRectangle(0,0,canvas.width,canvas.height,"#ffee22");
    let titleX = canvas.width*0.5-logoImg.width*0.5;
    let titleY = canvas.height*0.5-logoImg.height*0.5;
    
    ctx.drawImage(logoImg,titleX,titleY);

    if(Math.floor(gCurrentTime/200)%3===0)
    {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("Press Enter to Start",canvas.width/2-70,canvas.height*0.5+120);
    }
    
    
}

function SortHighScores()
{
    let i=0;
    for(i=maxHighScores-1;i>0;i--)
    {
        let higher = scoreBoard[i-1];
        if(scoreBoard[i].score > higher.score)
        {
            scoreBoard[i-1] = scoreBoard[i];
            scoreBoard[i] = higher;
        }
        else
            break;
    }
}

function UpdateHighScoreEntry(dt)
{
    let sx = 100, sy=90;

    if(inputStates.left)
        nameCurChar = Math.max(0,nameCurChar-1);
    else if(inputStates.right)
        nameCurChar = Math.min(maxScoreName-1,nameCurChar+1);
    else if(inputStates.up)
        newName[nameCurChar]++;
    else if(inputStates.down)
        newName[nameCurChar]--;

    inputStates.left = inputStates.right = inputStates.up = inputStates.down = false;

    if(newName[nameCurChar]< 65)
        newName[nameCurChar] = 90;

    if(newName[nameCurChar] > 90)
        newName[nameCurChar] = 65;

    if(inputStates.enter)
    {
         scoreBoard[maxHighScores-1]={
            name: String.fromCharCode(newName[0],newName[1],newName[2],newName[3]),
            score: gGame.score
        };
        SortHighScores();
        gGame.curGameState=GAME_STATE.SCORE_BOARD;
        inputStates.enter = false;
    }

    //Rendering
    ctx.font = "24px Arial";

    ctx.fillStyle="#000000";
    ctx.fillText("ENTER YOUR NAME: ",sx,sy);
    sy+=30;
    
    for(let i=0;i<maxScoreName;i++)
    {
        if(i===nameCurChar)
            ctx.fillStyle = "#3cff00";
        else
            ctx.fillStyle = "#000000";
        ctx.fillText(String.fromCharCode(newName[i]),sx,sy);
        sx +=30; 
    }
    
}

function UpdateScoreBoard(dt)
{
    if(inputStates.enter)
    {
        gGame.curGameState = GAME_STATE.TITLE;  
        inputStates.enter = false;
    }

    DrawRectangle(0,0,canvas.width,canvas.height,"#ffc400");

    let scoreX = 180, scoreY=100;
    let padding = 20;
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffffff";
    
    for(let i=0;i<maxHighScores;i++)
    {
        let s = scoreBoard[i];
        ctx.fillText(s.name+":\t"+s.score,scoreX,scoreY);
        scoreY+=padding;
    }
}

function draw(currentTime)
{
    gCurrentTime = currentTime;
    let deltaTime = (currentTime-lastFrameTime)/1000;
    deltaTime = Math.min(deltaTime,0.1);
    lastFrameTime=currentTime;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(gGame.curGameState===GAME_STATE.TITLE)
    {
        UpdateTitle(deltaTime);
    }
    else if(gGame.curGameState===GAME_STATE.PLAY)
    {
        UpdatePlay(deltaTime);
        DrawPlay();
    }
    else if(gGame.curGameState===GAME_STATE.GAME_OVER)
    {
        UpdateGameOver(deltaTime);
    }
    else if(gGame.curGameState===GAME_STATE.SCORE_BOARD)
    {
        UpdateScoreBoard(deltaTime);
    }
    else if(gGame.curGameState===GAME_STATE.SCORE_ENTRY)
    {
        UpdateHighScoreEntry(deltaTime);
    }
    
    requestAnimationFrame(draw);

}

draw();