import { flatten, initFileShaders, lookAt, mat4, perspective, rotateX, rotateY, rotateZ, scalem, translate, vec4 } from "./helperfunctions.js";
import { generateHill, getCylinderPoints, getHillPoints, getLeafPoints, singleCylinder, singleLeaf } from "./models.js";
import { chooseStrandCurvy, chooseStrandFunky, chooseStrandGeneric } from "./treestrands.js";
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
let vNormal;
let vAmbientDiffuseColor;
let vSpecularColor;
let vSpecularExponent;
let light_position;
let light_color;
let ambient_light;
let treeColor;
let leafColor;
let treePoints, leafPoints, hillPoints;
let treeString;
let branchStack; //for storing model (translate, rotate)
let scaleStack; //for storing scale
let bottom;
let top;
let bottomRadius;
let topRadius;
let scalingFactor;
let numCylinders;
let numLeaves;
let defaultCylinder;
let defaultLeaf;
let mouse_button_down = false;
let prevMouseX = 0;
let prevMouseY = 0;
let xAngle, yAngle, xRot, zRot;
let red;
let interval;
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
    hillPoints = generateHill(100, 1000, 10);
    treeColor = new vec4(0.7, 0.5, 0.2, 1.0);
    red = .3;
    leafColor = new vec4(red, 0.7, 0.3, 1.0);
    xAngle = yAngle = 0;
    xRot = zRot = 40;
    canvas.addEventListener("mousedown", mouse_down);
    canvas.addEventListener("mousemove", mouse_drag);
    canvas.addEventListener("mouseup", mouse_up);
    window.addEventListener("keydown", keys);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.4, 0.7, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);
};
function makeTreeBuffer() {
    let totalGeometry = hillPoints.concat(treePoints).concat(leafPoints);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(totalGeometry), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vNormal);
    vAmbientDiffuseColor = gl.getAttribLocation(program, "vAmbientDiffuseColor");
    vSpecularColor = gl.getAttribLocation(program, "vSpecularColor");
    vSpecularExponent = gl.getAttribLocation(program, "vSpecularExponent");
    light_position = gl.getUniformLocation(program, "light_position");
    light_color = gl.getUniformLocation(program, "light_color");
    ambient_light = gl.getUniformLocation(program, "ambient_light");
}
function buildTreeString(iterations, typeTree) {
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
                    switch (typeTree) {
                        case 1:
                            nextYear += chooseStrandFunky(rand);
                            xRot = zRot = 30;
                            break;
                        case 2:
                            nextYear += chooseStrandCurvy(rand);
                            xRot = zRot = 6;
                            top = 2;
                            topRadius = 9.85;
                            break;
                        default:
                            nextYear += chooseStrandGeneric(rand);
                            xRot = zRot = 40;
                    }
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
function convertToCylinders() {
    treePoints = [];
    leafPoints = [];
    numCylinders = 0;
    numLeaves = 0;
    scalingFactor = topRadius / bottomRadius;
    for (let i = 0; i < treeString.length; i++) {
        switch (treeString.charAt(i)) {
            case 'F':
                for (let i = 0; i < defaultCylinder.length; i++) {
                    treePoints[(numCylinders * defaultCylinder.length) + i] = model.mult(scale.mult(defaultCylinder[i]));
                }
                model = model.mult(translate(0.0, top - bottom, 0.0));
                scale = scale.mult(scalem(scalingFactor, 1.0, scalingFactor));
                numCylinders++;
                break;
            case 'X':
                break;
            case 'L':
                model = model.mult(rotateZ(zRot));
                break;
            case 'R':
                model = model.mult(rotateZ(-zRot));
                break;
            case '&':
                model = model.mult(rotateX(xRot));
                break;
            case '^':
                model = model.mult(rotateX(-xRot));
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
    gl.vertexAttrib4fv(vAmbientDiffuseColor, new vec4(.2, .6, .4, 1.0));
    gl.drawArrays(gl.TRIANGLES, 0, getHillPoints());
    gl.vertexAttrib4fv(vAmbientDiffuseColor, treeColor);
    gl.drawArrays(gl.TRIANGLES, getHillPoints(), getCylinderPoints() * numCylinders);
    gl.vertexAttrib4fv(vAmbientDiffuseColor, leafColor);
    gl.drawArrays(gl.TRIANGLES, getHillPoints() + getCylinderPoints() * numCylinders, getLeafPoints() * numLeaves);
}
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    proj = perspective(60.0, canvas.clientWidth / canvas.clientHeight, 1.0, 1000.0);
    gl.uniformMatrix4fv(uproj, false, proj.flatten());
    mv = lookAt(new vec4(0, 150, 500, 1), new vec4(0, 150, 0, 1), new vec4(0, 1, 0, 0));
    mv = mv.mult(rotateY(yAngle).mult(rotateX(xAngle)));
    gl.uniformMatrix4fv(umv, false, mv.flatten());
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttrib4fv(vSpecularColor, [1.0, 1.0, 1.0, 1.0]);
    gl.vertexAttrib1f(vSpecularExponent, 30.0);
    gl.uniform4fv(light_position, mv.mult(new vec4(0, 500, 0, 1)).flatten());
    gl.uniform4fv(light_color, [1, 1, 1, 1]);
    gl.uniform4fv(ambient_light, [.5, .5, .5, 5]);
    //buildTreeString(1);
    mv = mv.mult(scalem(.9, .9, .9));
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
            clearTree();
            buildTreeString(5, 0);
            break;
        case "f":
            clearTree();
            buildTreeString(5, 1);
            break;
        case "c":
            clearTree();
            buildTreeString(5, 2);
            break;
        case ".":
            window.clearInterval(interval);
            changeLeafColors();
            break;
    }
    requestAnimationFrame(render);
}
function changeLeafColors() {
    interval = window.setInterval(update, 1000);
    function update() {
        red = red + (1.0 - red) / 2;
        leafColor = new vec4(red, 0.7 - (.3 * red), 0.3 - (.3 * red), 1.0);
        requestAnimationFrame(render);
    }
}
function clearTree() {
    model = new mat4();
    scale = new mat4();
    treeString = "[X]";
    branchStack = [];
    scaleStack = [];
    numCylinders = 0;
    numLeaves = 0;
    bottomRadius = 10;
    topRadius = 9.5;
    bottom = 0;
    top = 5;
    red = .3;
    leafColor = new vec4(red, 0.7, 0.3, 1.0);
    xAngle = yAngle = 0;
    xRot = zRot = 40;
}
//# sourceMappingURL=generatetrees.js.map