import { flatten, initFileShaders, lookAt, mat4, perspective, rotateX, rotateY, rotateZ, scalem, translate, vec4 } from "./helperfunctions.js";
import { getCylinderPoints, getLeafPoints, singleCylinder, singleLeaf } from "./cylinder.js";
let gl;
let program;
let canvas;
let buffer;
let mv; //for moving vertices to eye space
let model; //for transforming vertices by rotation, translation
let scale; //for scaling the tree, separate from rotating
let proj;
let umv;
let uproj;
let vPosition;
let vColor;
let treeColor;
let leafColor;
let treePoints;
let leafPoints;
let treeString;
let branchStack; //for storing model (translate, rotate)
let scaleStack; //for storing scale
let bottom;
let top;
let bottomRadius;
let topRadius;
let numCylinders;
let numLeaves;
let defaultCylinder;
let defaultLeaf;
let mouse_button_down = false;
let prevMouseX = 0;
let prevMouseY = 0;
let xAngle;
let yAngle;
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL isn't available");
    }
    program = initFileShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");
    model = new mat4();
    scale = new mat4();
    treeString = "[X]";
    branchStack = [];
    scaleStack = [];
    //TODO are these needed?
    numCylinders = 0;
    numLeaves = 0;
    bottomRadius = 10;
    topRadius = 9.5;
    bottom = 0;
    top = 5;
    defaultCylinder = singleCylinder(bottom, top, bottomRadius, topRadius);
    defaultLeaf = singleLeaf(top, 3);
    treeColor = new vec4(0.7, 0.5, 0.2, 1.0);
    leafColor = new vec4(0.3, 0.7, 0.2, 1.0);
    xAngle = yAngle = 0;
    canvas.addEventListener("mousedown", mouse_down);
    canvas.addEventListener("mousemove", mouse_drag);
    canvas.addEventListener("mouseup", mouse_up);
    window.addEventListener("keydown", keys);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.1, 0.2, 0.4, 1.0);
    gl.enable(gl.DEPTH_TEST);
};
function makeTreeBuffer() {
    let totalGeometry = treePoints.concat(leafPoints);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(totalGeometry), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(vPosition);
    vColor = gl.getAttribLocation(program, "vColor");
}
function buildTreeString(iterations) {
    for (let level = 0; level < iterations; level++) {
        let nextYear = "";
        for (let i = 0; i < treeString.length; i++) {
            //TODO possibly shorten this up later
            switch (treeString.charAt(i)) {
                case '&':
                    nextYear += "&";
                    break;
                case '^':
                    nextYear += "^";
                    break;
                case 'F':
                    nextYear += "FF";
                    break;
                case 'L':
                    nextYear += "L";
                    break;
                case 'R':
                    nextYear += "R";
                    break;
                case 'X': //branching production
                    let rand = Math.random();
                    nextYear += chooseStrand(rand);
                    break;
                case 'V': //leaf production
                    nextYear += "V";
                case '\"':
                    nextYear += "\"";
                    break;
                case '[':
                    nextYear += "[";
                    break;
                case ']':
                    nextYear += "]";
                    break;
            }
        }
        treeString = nextYear;
    }
    convertToCylinders();
    makeTreeBuffer();
}
function chooseStrand(rand) {
    let nextYear = "";
    //first one: kinda realistic quaking aspen/red maple-like trees
    // experiment: X;   F-->FF and X --> F+[-F-XF-X][+FF][-XF[+X]][++F-X]
    //TODO scale tree with " before rest of nextYear
    if (rand < .1)
        nextYear += "F[LX[V]][^X[V]]F[RX[V]][&X[V]]FX";
    else if (rand < .2)
        nextYear += "F[LX[V]][&X[V]]F[RX[V]][^X[V]]FX";
    else if (rand < .3)
        nextYear += "F[L^X[V]][&X[V]][RX[V]][^X[V]]F[RX[V]][L&X[V]][&X[V]][^X[V]]FX";
    else if (rand < .4)
        nextYear += "F[L&X[V]][&X[V]][R^X[V]][^X[V]]F[LX[V]]L[&X[V]]R[^X[V]]FX";
    else if (rand < .5)
        nextYear += "F[LX[V]][&LX[V]][R&X[V]][^LX[V]]F[RX[V]][L^X[V]][&X[V]][^X[V]]FX";
    else if (rand < .6)
        nextYear += "F[LX[V]][&X[V]][RX[V]]F[RX[V]][L^X[V]][&X[V]][^X[V]]FX";
    else if (rand < .7)
        nextYear += "F[LX[V]][&X[V]][RX[V]][^X[V]]F[RX[V]][LX[V]][&X[V]][^X[V]]FX";
    else if (rand < .8)
        nextYear += "F[RX[V]][L&X[V]][^X[V]]F[RX[V]]L[L^X[V]]R[&X[V]]FX";
    else if (rand < .9)
        nextYear += "F[LX[V]]R[&X[V]][RX[V]][^LLX[V]]F[RX[V]][L&X[V]][&X[V]][^RX[V]]FX";
    else
        nextYear += "F[LX[V]][&X[V]][RX[V]][^X[V]]F[RX[V]][LX[V]][&X[V]][^X[V]]FX";
    return nextYear;
}
function convertToCylinders() {
    treePoints = [];
    leafPoints = [];
    numCylinders = 0;
    numLeaves = 0;
    for (let i = 0; i < treeString.length; i++) {
        switch (treeString.charAt(i)) {
            case 'F':
                for (let i = 0; i < defaultCylinder.length; i++) {
                    treePoints[(numCylinders * defaultCylinder.length) + i] = model.mult(scale.mult(defaultCylinder[i]));
                }
                model = model.mult(translate(0.0, top - bottom, 0.0));
                scale = scale.mult(scalem(.95, 1.0, .95));
                numCylinders++;
                break;
            case 'X':
                break;
            case 'L':
                model = model.mult(rotateZ(40));
                break;
            case 'R':
                model = model.mult(rotateZ(-40));
                break;
            case '&':
                model = model.mult(rotateX(40));
                break;
            case '^':
                model = model.mult(rotateX(-40));
                break;
            case 'V': //vegetation
                for (let i = 0; i < defaultLeaf.length; i++) {
                    leafPoints[(numLeaves * defaultLeaf.length) + i] = model.mult(defaultLeaf[i]);
                }
                numLeaves++;
                break;
            case '\"':
                break;
            case '[':
                branchStack.push(model);
                scaleStack.push(scale);
                break;
            case ']':
                model = branchStack.pop();
                scale = scaleStack.pop();
                break;
        }
    }
}
function drawTrees() {
    gl.uniformMatrix4fv(umv, false, mv.flatten());
    gl.vertexAttrib4fv(vColor, treeColor);
    gl.drawArrays(gl.TRIANGLES, 0, getCylinderPoints() * numCylinders);
    gl.vertexAttrib4fv(vColor, leafColor);
    gl.drawArrays(gl.TRIANGLES, getCylinderPoints() * numCylinders, getLeafPoints() * numLeaves);
}
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    proj = perspective(60.0, canvas.clientWidth / canvas.clientHeight, 1.0, 1000.0);
    gl.uniformMatrix4fv(uproj, false, proj.flatten());
    mv = lookAt(new vec4(0, 150, 500, 1), new vec4(0, 150, 0, 1), new vec4(0, 1, 0, 0));
    mv = mv.mult(rotateY(yAngle).mult(rotateX(xAngle)));
    gl.uniformMatrix4fv(umv, false, mv.flatten());
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 16, 0);
    //buildTreeString(1);
    //mv = mv.mult(scalem(1.5,1.5,1.5));
    drawTrees();
}
function mouse_drag(event) {
    let thetaY, thetaX;
    if (mouse_button_down) {
        thetaY = 360.0 * (event.clientX - prevMouseX) / canvas.clientWidth;
        thetaX = 360.0 * (event.clientY - prevMouseY) / canvas.clientHeight;
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
        xAngle += thetaX;
        yAngle += thetaY;
    }
    requestAnimationFrame(render);
}
function mouse_down(event) {
    //establish point of reference for dragging mouse in window
    mouse_button_down = true;
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
    requestAnimationFrame(render);
}
function mouse_up() {
    mouse_button_down = false;
    requestAnimationFrame(render);
}
function keys(event) {
    switch (event.key) {
        case " ":
            buildTreeString(5);
            break;
    }
    requestAnimationFrame(render);
}
//# sourceMappingURL=generatetrees.js.map