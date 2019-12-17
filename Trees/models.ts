import {vec4} from "./helperfunctions.js";

let cylinderPoints:number;
let leafPoints:number;
let hillPoints:number;
let cylinderModel:vec4[];
let leafModel:vec4[];
let hillModel:vec4[];

/**
 * @param top represents the upper y coordinate of the cylinder
 * @param bottom is for the lower y coordinate
 * @param radiusBottom
 * @param radiusTop
 * @param subdivision determines cylinder tessellation
 */
function generateCylinder(bottom:number, top:number, radiusBottom:number, radiusTop:number, subdivision:number){
    cylinderPoints = 0;

    let step:number = (360.0 / subdivision)*(Math.PI / 180.0);
    for (let a:number = 0; a <= 2*Math.PI ; a += step){
        let corner1 = new vec4(radiusTop * Math.cos(a), top, radiusTop * Math.sin(a), 1.0);
        let corner2 = new vec4(radiusBottom * Math.cos(a), bottom, radiusBottom * Math.sin(a), 1.0);
        let corner3 = new vec4(radiusBottom * Math.cos(a + step), bottom, radiusBottom * Math.sin(a + step), 1.0);
        let corner4 = new vec4(radiusTop * Math.cos(a + step), top, radiusTop * Math.sin(a + step), 1.0);
        let normal = new vec4(Math.cos(a), -1/((top-bottom)/(radiusTop-radiusBottom)), Math.sin(a), 0.0);
        //triangle 1
        cylinderModel.push(corner1); cylinderModel.push(normal);
        cylinderModel.push(corner2); cylinderModel.push(normal);
        cylinderModel.push(corner3); cylinderModel.push(normal);
        //triangle 2
        cylinderModel.push(corner1); cylinderModel.push(normal);
        cylinderModel.push(corner3); cylinderModel.push(normal);
        cylinderModel.push(corner4); cylinderModel.push(normal);

        cylinderPoints+=6;
    }
}

function generateLeaf(top:number, size:number){
    leafPoints = 0;

    //top = top of the cylinder; size = scaling factor of leaf
    let normal1 = new vec4(0.0, 1.0, -1.0, 0.0);
    let normal2 = new vec4(0.0, .45, .9, 0.0);
    //first leaf half
    leafModel.push(new vec4(0.0, top, 0.0, 1.0));
    leafModel.push(normal1);
    leafModel.push(new vec4(size, top - size, size, 1.0));
    leafModel.push(normal1);
    leafModel.push(new vec4(-size, top - size, size, 1.0));
    leafModel.push(normal1);
    //second leaf half
    leafModel.push(new vec4(size, top - size, size, 1.0));
    leafModel.push(normal2);
    leafModel.push(new vec4(-size, top - size, size, 1.0));
    leafModel.push(normal2);
    leafModel.push(new vec4(0.0, top - 2*size, 1.5*size, 1.0));
    leafModel.push(normal2);

    leafPoints+=6;
}

export function generateHill(height:number, width:number, step:number):vec4[]{
    hillModel = [];
    hillPoints = 0;
    let scalingFactor:number = 2*Math.PI/width;
    let distance:number;
    for(let x = -width/2; x < width/2; x += step){
        for(let z = -width/2; z < width/2; z += step){
            distance = Math.sqrt((z*z) + (x*x));
            /*let corner1 = new vec4(x, height*(Math.cos(scalingFactor*distance))-height, z, 1.0);
            let corner2 = new vec4(x + step, height*(Math.cos(scalingFactor*distance))-height, z, 1.0);
            let corner3 = new vec4(x, height*(Math.cos(scalingFactor*distance))-height, z + step, 1.0);
            let corner4 = new vec4(x + step, height*(Math.cos(scalingFactor*distance))-height, z + step, 1.0);
            */
            let corner1 = new vec4(x, height*(Math.cos(scalingFactor*Math.sqrt((z*z) + (x*x))))-height, z, 1.0);
            let corner2 = new vec4(x + step, height*(Math.cos(scalingFactor*Math.sqrt((z*z) + ((x+step)*(x+step)))))-height, z, 1.0);
            let corner3 = new vec4(x, height*(Math.cos(scalingFactor*Math.sqrt(((z+step)*(z+step))+ (x*x))))-height, z + step, 1.0);
            let corner4 = new vec4(x + step, height*(Math.cos(scalingFactor*Math.sqrt(((z+step)*(z+step)) + ((x+step)*(x+step)))))-height, z + step, 1.0);
            // */
            //TODO fix normals
            let normal1 = new vec4(0.0, 1.0, 0.0, 0.0);
            let normal2 = new vec4(0.0, 1.0, 0.0, 0.0);

            hillModel.push(corner1); hillModel.push(normal1);
            hillModel.push(corner2); hillModel.push(normal1);
            hillModel.push(corner3); hillModel.push(normal1);
            hillModel.push(corner2); hillModel.push(normal2);
            hillModel.push(corner3); hillModel.push(normal2);
            hillModel.push(corner4); hillModel.push(normal2);
            hillPoints += 6;
        }
    }
    return hillModel;
}

export function singleCylinder(bottom:number, top:number, radiusBottom:number, radiusTop:number):vec4[]{
    cylinderModel = [];
    generateCylinder(bottom, top, radiusBottom, radiusTop,20);
    return cylinderModel;
}

export function singleLeaf(top:number, size:number):vec4[]{
    leafModel = [];
    generateLeaf(top, size);
    return leafModel;
}

//Flaws with these: will return nothing called before a
//single object is made.
export function getCylinderPoints():number{
    return cylinderPoints;
}

export function getLeafPoints():number{
    return leafPoints;
}

export function getHillPoints():number{
    return hillPoints;
}