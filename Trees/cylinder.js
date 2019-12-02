import { vec4 } from "./helperfunctions.js";
let cylinderPoints;
let cylinderModel;
function initialize() {
    cylinderModel = [];
}
/**
 * @param top represents the upper y coordinate of the cylinder
 * @param bottom is for the lower y coordinate
 * @param subdivision determines cylinder tessellation
 */
function generateCylinder(bottom, top, radiusBottom, radiusTop, subdivision) {
    cylinderPoints = 0;
    let step = (360.0 / subdivision) * (Math.PI / 180.0);
    for (let a = 0; a <= 2 * Math.PI; a += step) {
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
        cylinderPoints += 6;
    }
}
export function singleCylinder(bottom, top, radiusBottom, radiusTop) {
    initialize();
    generateCylinder(bottom, top, radiusBottom, radiusTop, 20);
    return cylinderModel;
}
export function getCylinderPoints() {
    return cylinderPoints;
}
//# sourceMappingURL=cylinder.js.map