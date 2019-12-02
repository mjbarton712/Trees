import { flatten, initFileShaders, lookAt, mat4, perspective, rotateX, rotateY, rotateZ, translate, vec4 } from "./helperfunctions.js";
import { getCylinderPoints, singleCylinder } from "./cylinder.js";
let gl;
let program;
let canvas;
let buffer;
let mv;
let proj;
let umv;
let uproj;
let vPosition;
let vColor;
let rgba;
let treePoints;
let treeString;
let branchStack;
//TODO work with these
let bottom;
let top;
let bottomRadius;
let topRadius;
let numCylinders;
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
    treePoints = [];
    treeString = "[X]";
    branchStack = [];
    numCylinders = 0;
    bottomRadius = 2;
    topRadius = 1.98;
    bottom = 0;
    top = 5;
    rgba = new vec4(0.7, 0.5, 0.2, 1.0);
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
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(treePoints), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(vPosition);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttrib4fv(vColor, rgba);
}
function buildTreeString(iterations) {
    for (let times = 0; times < iterations; times++) {
        let nextYear = "";
        for (let i = 0; i < treeString.length; i++) {
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
                case 'X':
                    let rand = Math.random();
                    nextYear += chooseStrand(rand);
                    break;
                case '\/':
                    nextYear += "\/";
                    break;
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
}
function chooseStrand(rand) {
    let nextYear = "";
    //first two: kinda realistic quaking aspen/red maple-like trees
    //last one: starting to get to pine trees
    //TODO scale tree with " before rest of nextYear
    if (rand < .3)
        nextYear += "F[LX][^X]F[RX][&X]FX";
    //nextYear += "F[LL^X][&&X]F[RX][L&X]FX";
    //nextYear += "F[LLX][RR^X]F[L&&X][^X]F[RR&X]F[L^^^X][LL&X]F[RRR^X]FX";
    else if (rand < .7)
        nextYear += "F[LX][&X]F[RX][^X]FX";
    //nextYear += "F[R^X][&&X]F[R&X][LX]FX";
    //nextYear += "F[LLLX]F[RR^X][^X]F[L^^X][LLL&X][RRR^X]FX";
    /**else if (rand < .3)
        nextYear += "F[L^X][&X][RX][^X]F[RX][L&X][&X][^X]FX";
    else if (rand < .4)
        nextYear += "F[L&X][&X][R^X][^X]F[LX]L[&X][^X]FX";
    else if (rand < .5)
        nextYear += "F[LX][&LX][R&X][^LX]F[RX][L^X][&X][^X]FX";
    else if (rand < .6)
        nextYear += "F[LX][&X][RX]F[RX][L^X][&X][^X]FX";
    else if (rand < .7)
        nextYear += "F[LX][&X][RX][^X]F[RX][LX][&X][^X]FX";
    else if (rand < .8)
        nextYear += "F[RX][L&X][^X]F[RX][L^X]R[&X]FX";
    else if (rand < .9)
        nextYear += "F[LX]R[&X][RX][^LLX]F[RX][L&X][&X][^RX]FX"; */
    else
        nextYear += "F[LX][&X][RX][^X]F[RX][LX][&X][^X]FX";
    //nextYear += "F[LL^X][&X][RRX]F[&&X][L&X][R^X]FX";
    //nextYear += "F[RRRX][LL&&X]F[^X]F[RRR&X][LL&X]F[R^X]FX";
    return nextYear;
}
function convertToCylinders() {
    let model = new mat4();
    let cylinder;
    for (let i = 0; i < treeString.length; i++) {
        switch (treeString.charAt(i)) {
            case 'F':
                cylinder = singleCylinder(bottom, top, bottomRadius, topRadius);
                for (let i = 0; i < cylinder.length; i++) {
                    cylinder[i] = model.mult(cylinder[i]);
                }
                model = model.mult(translate(0.0, top - bottom, 0.0));
                //model = model.mult(scalem(.99,.99,.99));
                treePoints = treePoints.concat(cylinder);
                numCylinders++;
                break;
            case 'X':
                break;
            case 'L':
                model = model.mult(rotateZ(30));
                break;
            case 'R':
                model = model.mult(rotateZ(-30));
                break;
            case '&':
                model = model.mult(rotateX(30));
                break;
            case '^':
                model = model.mult(rotateX(-30));
                break;
            case '\"':
                break;
            case '[':
                branchStack.push(model);
                break;
            case ']':
                model = branchStack.pop();
                break;
        }
    }
}
function drawTrees() {
    gl.uniformMatrix4fv(umv, false, mv.flatten());
    gl.drawArrays(gl.TRIANGLES, 0, getCylinderPoints() * numCylinders);
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
    //buildTreeString(3);
    convertToCylinders();
    makeTreeBuffer();
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
        case " ": //wont do anything in future
            buildTreeString(1);
            //makeTreeBuffer();
            break;
    }
    requestAnimationFrame(render);
}
//# sourceMappingURL=generatetrees.js.map