const imagePaths = {
    title: "./game/assets/logo_small.png"
};

const totalImages = Object.keys(imagePaths).length;
let loadedImagesCount = 0;
const images = {};
let imagesReady = false;

function OnImageLoad()
{
    loadedImagesCount++;
    if(loadedImagesCount===totalImages)
        imagesReady=true;
}

function LoadResources()
{
    for(let key in imagePaths)
    {
        const img = new Image();
        img.onload = OnImageLoad();
        img.src = imagePaths[key];
        images[key] = img;
    }
}

function GetLoadedPercentage()
{
    if(totalImages===0) //avoid division by 0
        return 0;
    else
        return loadedImagesCount/totalImages;
}
