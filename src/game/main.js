const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_STATE = {
    TITLE: 0,
    PLAY: 1,
    GAME_OVER: 2,
    SCORE_BOARD: 3
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
    if(relativeX > 0 && relativeX < canvas.width)
    {
        
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

//Doesn't work because inputStates is not an array.
// function ResetInputs()
// {
//     for(let i=0;i<inputStates.length;i++)
//         inputStates[i] = false;
// }

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

function GetRandomInt(min,max)
{
    return min + (Math.floor(Math.random()*(max-min)));
}

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
    y: canvas.height-15,
    w: 50,
    h: 30
};

let scrollDisplay = {
    text: "",
    timer: 0,
    phase: 0,
    yPos: -20,
    isActive: false
};

let timer = 0;

let maxBrickCols = 10;
let maxBrickRows = 4;
const brickWidth = 32;
const brickHeight = 16;
const brickPadding = 5;
const screenOffsetX = 20;
const screenOffsetY = 10;

const NEXT_BONUS_LIFE = 500;

let maxLevels = 0;
const levels = []

//level 1
levels[maxLevels++] = [
    0,0,0,0,0,0,0,0,0,0,
    0,0,1,1,1,1,1,1,0,0,
    0,0,0,1,1,1,1,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
  
];

levels[maxLevels++] = [
    0,0,0,0,0,0,0,0,0,0,
    0,0,1,1,1,1,1,0,0,0,
    0,0,1,1,1,1,1,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
  
];

//level 2
levels[maxLevels++] = [
    0,2,2,2,2,2,2,2,2,0,
    0,1,1,1,1,1,1,1,1,0,
    0,0,1,1,1,1,1,1,1,0,
    0,0,0,0,0,0,1,0,0,0,
  
];

levels[maxLevels++] = [
    0,0,2,2,2,2,2,2,0,0,
    0,2,1,1,1,1,1,1,2,0,
    0,2,2,1,1,1,1,2,2,0,
    0,0,0,0,0,0,1,0,0,0,
  
];

let brickCount = 0;
let bricks = [];

let balls = []; //might have multiple balls
let ballSpeedScale = 1;

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

const powerupSpeed = 4;
let powerupCount = 0;
let powerups = [];

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

            if(brickType==1)
            {
                bricks[brickCount++] = {
                x: sx,
                y: sy,
                color: "#35c528",
                health: 1,
                isAlive: 1,
                brickType: brickType,
                value: 10
                }
            }
            else if(brickType==2)
            {
                bricks[brickCount++] = {
                x: sx,
                y: sy,
                color: "#eca115",
                health: 3,
                isAlive: 1,
                brickType: brickType,
                value: 20
                }
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
    let normal = {
        x:0,
        y:0
    };

    let xOverlap = (ball.x+ball.radius>x+w)? x+w-ball.x : x-ball.x+ball.radius;
    let yOverlap = (ball.y+ball.radius>y+h)? y+h-ball.y : y-ball.y+ball.radius;
    xOverlap = Math.abs(xOverlap);
    yOverlap = Math.abs(yOverlap);

    if (xOverlap < yOverlap)
    {
        if(ball.x>x)
            normal.x = -1;
        else
            normal.x = 1;
    }
    else
    {
         if(ball.y>y)
            normal.y = 1;
        else
            normal.y = -1;
    }

    let dot = ball.dx*normal.x + ball.dy*normal.y;

    ball.dx = ball.dx - (2.0*normal.x)*dot;
    ball.dy = ball.dy - (2.0*normal.y)*dot;
}

function CheckCollisions()
{
    //brick collisions
    for(let i=0;i<brickCount;i++)
    {
        let b = bricks[i];
        if(!b.isAlive)continue;
        
        for(let j=0;j<gGame.ballCount;j++)
        {
            //NOTE: This causes an error because each ball is checked against a brick
            //even if one ball already destroyed the brick.
            //Need to move the brick loop to inside the ball loop instead.
            let ball = balls[j];
            if(CheckAABB(ball.x,ball.y,ball.radius,ball.radius,b.x,b.y,brickWidth,brickHeight))
            {
                if(--b.health<=0)
                {
                    b.isAlive=false;
                    GetScore(b.value);
                    gGame.destroyedBricks++;

                    let roll = GetRandomInt(0,10);
                    if(roll > 3)
                    {
                        roll = GetRandomInt(0,POWERUP_TYPE.MAX_POWERUP_TYPE);
                        NewPowerup(b.x,b.y,roll);
                    }
                }

                //handle ball bounce
                BallBounce(ball,b.x,b.y,brickWidth,brickHeight);
            }
        }
    }

    //Paddle-ball collisions, ball to ground collisions
    for(let i=0;i<gGame.ballCount;i++)
    {
        let ball = balls[i];
        if(CheckAABB(ball.x,ball.y,ball.radius,ball.radius,paddle.x,paddle.y,paddle.w,paddle.h))
        {
            BallBounce(ball,paddle.x,paddle.y,paddle.w,paddle.h);
        }

        if(ball.x < 0)
        {
            ball.x = 0;
            ball.dx = -ball.dx;
        }
            
        if(ball.x+ball.radius>canvas.width)
        {
            ball.x = canvas.width-ball.radius;
            ball.dx = -ball.dx;
        }
            
        if(ball.y < 0)
        {
            ball.y = 0;
            ball.dy = -ball.dy;
        }
            
        if(ball.y>canvas.height)
        {
            RemoveBall(i);
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
    let y = 20;
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${gGame.score}`,10,y);
    y+=30;
    ctx.fillText(`Lives: ${gGame.lives}`,10,y);
    y+=30;
    ctx.fillText(`Level: ${gGame.curLevel+1}`,10,y);
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
    paddle.x = (canvas.width-30)/2;
    paddle.y = canvas.height-15;

    gGame.ballCount = 0;
    ballSpeedScale = 1;
    NewBall(paddle.x+10,paddle.y);

    balls[0].y -= balls[0].radius;

    SetScrollDisplay(`Level: ${gGame.curLevel+1}`);

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

function UpdateScrollDisplay()
{
    if(scrollDisplay.timer==0)
    {
        scrollDisplay.yPos+=5;
        if(scrollDisplay.phase==0 && scrollDisplay.yPos>canvas.height*0.5)
        {
            scrollDisplay.timer += 60;
            scrollDisplay.phase++;
        }
        else if(scrollDisplay.phase==1 && scrollDisplay.yPos>canvas.height)
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

function UpdatePlay()
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
        UpdateScrollDisplay();
        return;
    }
    //INPUT
    let speed = 10;
    if(inputStates.right)
    {
        paddle.x = Math.min(paddle.x + speed,canvas.width-paddle.w);
    }
    else if(inputStates.left)
    {
        paddle.x = Math.max(paddle.x - speed,0);
    }

    //Powerup test
    if(inputStates.enter)
    {
        GetPowerup(POWERUP_TYPE.MULTI_BALL);
        inputStates.enter=false;
    }
   

    //UPDATE
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
                b.dx = -5;
                b.dy = -2;
            }
            
        }
        else
        {
            b.x += b.dx * ballSpeedScale;
            b.y += b.dy * ballSpeedScale;
        }

    }

    for(let i=0;i<powerupCount;i++)
    {
        let p = powerups[i];
        p.y += powerupSpeed;

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
    //RENDER
    DrawPowerups();
    DrawBricks();
    DrawRectangle(paddle.x,paddle.y,paddle.w,paddle.h,"#FFFF00");
    DrawLineRectangle(paddle.x,paddle.y,paddle.w,paddle.h,"#000000",2);
    DrawBalls();
    DrawHud();

    if(scrollDisplay.isActive)
    {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText(scrollDisplay.text,canvas.width*0.5,scrollDisplay.yPos);    
    }
    
}

function UpdateGameOver()
{
    //UPDATE
    if(inputStates.enter)
    {
        gGame.curGameState = GAME_STATE.TITLE;
        inputStates.enter = false;
    }
        

    //RENDER
    DrawRectangle(0,0,canvas.width,canvas.height,"#ff0011");

    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("GAME OVER",canvas.width/2-30,canvas.height/2);
    
}

function UpdateTitle()
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

    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("SILLY BALLS AND BRICKS",canvas.width/2-70,canvas.height/2);
    
}

function draw()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(gGame.curGameState===GAME_STATE.TITLE)
    {
        UpdateTitle();
    }
    else if(gGame.curGameState===GAME_STATE.PLAY)
    {
        UpdatePlay();
        DrawPlay();
    }
    else if(gGame.curGameState===GAME_STATE.GAME_OVER)
    {
        UpdateGameOver();
    }
    
    requestAnimationFrame(draw);

}

draw();