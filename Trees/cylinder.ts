import {vec4} from "./helperfunctions.js";

let cylinderPoints:number;
let leafPoints:number;
let cylinderModel:vec4[];
let leafModel:vec4[];

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
        //triangle 1
        cylinderModel.push(corner1);
        cylinderModel.push(corner2);
        cylinderModel.push(corner3);
        //triangle 2
        cylinderModel.push(corner1);
        cylinderModel.push(corner3);
        cylinderModel.push(corner4);

        cylinderPoints+=6;
    }
}

function generateLeaf(top:number, size:number){
    //NOTE: in the future, for a complex leaf, calculate leafPoints in here
    //first leaf half
    leafModel.push(new vec4(0.0, top, 0.0, 1.0));
    leafModel.push(new vec4(size, top - size, size, 1.0));
    leafModel.push(new vec4(-size, top - size, size, 1.0));
    //second leaf half
    leafModel.push(new vec4(size, top - size, size, 1.0));
    leafModel.push(new vec4(-size, top - size, size, 1.0));
    leafModel.push(new vec4(0.0, top - 2*size, 1.5*size, 1.0));
}

export function singleCylinder(bottom:number, top:number, radiusBottom:number, radiusTop:number):vec4[]{
    cylinderModel = [];
    generateCylinder(bottom, top, radiusBottom, radiusTop,20);
    return cylinderModel;
}

export function singleLeaf(top:number, size:number){
    leafModel = [];
    generateLeaf(top, size);
    return leafModel;
}

export function getCylinderPoints():number{
    return cylinderPoints;
}

export function getLeafPoints():number{
    leafPoints = 6;
    return leafPoints;
}