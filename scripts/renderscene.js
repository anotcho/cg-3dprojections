var view;
var ctx;
var scene;
var start_time;
var LEFT = 32; // binary 100000
var RIGHT = 16; // binary 010000
var BOTTOM = 8; // binary 001000
var TOP = 4; // binary 000100
var NEAR = 2; // binary 000010
var FAR = 1; // binary 000001

// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(Animate);
}

// Animation loop - repeatedly calls rendering code
function Animate(timestamp) {
    // step 1: calculate time (time since start) 
    // step 2: transform models based on time
    // step 3: draw scene
    // step 4: request next animation frame (recursively calling same function)


    var time = timestamp - start_time;

    // ... step 2

    DrawScene();

    window.requestAnimationFrame(Animate);
}

// Main drawing code - use information contained in variable `scene`
function DrawScene() {
    console.log(scene);
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 38: // UP Arrow
            console.log("up");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 40: // DOWN Arrow
            console.log("down");
            break;
    }
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}

function OutcodePer(pt, view) {
    var outcode = 0;
    var zmin = -1(view.clip[4]/view.clip[5]);
    if (pt.x < pt.z) outcode += LEFT;
    else if (pt.x > -pt.z) outcode += RIGHT;
    if (pt.y < pt.z) outcode += BOTTOM;
    else if (pt.y > -pt.z) outcode += TOP;
    if (pt.z < zmin) outcode += NEAR;
    else if (pt.z > -1) outcode += FAR;
    return outcode;
}

function OutcodePar(pt, view) {
    var outcode = 0;
    if (pt.x < -1) outcode += LEFT;
    else if (pt.x > 1) outcode += RIGHT;
    if (pt.y < -1) outcode += BOTTOM;
    else if (pt.y > 1) outcode += TOP;
    if (pt.z < 0) outcode += NEAR;
    else if (pt.z > -1) outcode += FAR;
    return outcode;
}

function percline(pt0, pt1, view) {
    var at0 = OutcodePer(pt0, view);
    var at1 = OutcodePer(pt1, view);

    if ((at0 | at1) === 0) { // once both line endpoints are inside view, return the points
        return { pt0: pt0, pt1: pt1 , pt2: pt2};
    } else if ((at0 & at1) !== 0) { // if line is outside view, return null
        return null;
    } else {
        var cp;
        var hp;
        var np = { x: 0, y: 0 , z: 0};
        var t;
        var at;

        //get endpoint outside view
        if (at0 > 0) {
            cp = pt0;
            hp = pt1;
            at = at0;
        } else if (at1 > 0) {
            cp = pt1;
            hp = pt0;
            at = at1;
        }

        var xchange = (cp.x - hp.x);
        var ychange = (cp.y - hp.y);
        var zchange = (cp.z - hp.z);

        //find first bit set to 1 and select view edge
        if ((at - 32) >= 0){
            t = (view.clip[0] - cp.x) / xchange;
            at -= 32;
        } else if ((at - 16) >= 0){
            t = (view.clip[1] - cp.x) / xchange;
            at -= 16;
        } else if ((at - 8) >= 0) {
            t = (view.clip[2] - cp.y) / ychange;
            at -= 8;
        } else if ((at - 4) >= 0) {
            t = (view.clip[3] - cp.y) / ychange;
            at -= 4;
        } else if ((at - 2) >= 0) {
            t = (view.clip[4] - cp.y) / ychange;
            at -= 2;
        } else {
            t = (view.clip[5] - cp.y) / ychange;
            at -= 1;
        }

        //find new point at view edge
        np.x = cp.x + t * xchange;
        np.y = cp.y + t * ychange;
        np.z = cp.z + t * zchange;

        //replace endpoint and loop recursively
        return cline(np, hp, view);
    }
}

function parcline(pt0, pt1, view) {
    var at0 = OutcodePar(pt0, view);
    var at1 = OutcodePar(pt1, view);

    if ((at0 | at1) === 0) { // once both line endpoints are inside view, return the points
        return { pt0: pt0, pt1: pt1 };
    } else if ((at0 & at1) !== 0) { // if line is outside view, return null
        return null;
    } else {
        var cp;
        var hp;
        var np = { x: 0, y: 0 , z: 0};
        var t;
        var at;

        //get endpoint outside view
        if (at0 > 0) {
            cp = pt0;
            hp = pt1;
            at = at0;
        } else if (at1 > 0) {
            cp = pt1;
            hp = pt0;
            at = at1;
        }

        var xchange = (cp.x - hp.x);
        var ychange = (cp.y - hp.y);
        var zchange = (cp.z - hp.z);

        //find first bit set to 1 and select view edge
        if ((at - 32) >= 0){
            t = (view.clip[0] - cp.x) / xchange;
            at -= 32;
        } else if ((at - 16) >= 0){
            t = (view.clip[1] - cp.x) / xchange;
            at -= 16;
        } else if ((at - 8) >= 0) {
            t = (view.clip[2] - cp.y) / ychange;
            at -= 8;
        } else if ((at - 4) >= 0) {
            t = (view.clip[3] - cp.y) / ychange;
            at -= 4;
        } else if ((at - 2) >= 0) {
            t = (view.clip[4] - cp.y) / ychange;
            at -= 2;
        } else {
            t = (view.clip[5] - cp.y) / ychange;
            at -= 1;
        }

        //find new point at view edge
        np.x = cp.x + t * xchange;
        np.y = cp.y + t * ychange;
        np.z = cp.z + t * zchange;

        //replace endpoint and loop recursively
        return cline(np, hp, view);
    }
}
