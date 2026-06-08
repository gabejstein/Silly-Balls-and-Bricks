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

//General
function GetRandomInt(min,max)
{
    return min + (Math.floor(Math.random()*(max-min)));
}