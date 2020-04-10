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
    /*scene = {
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
    };*/

    scene = {
        view: {
          type: 'parallel',
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
var i;
var nper;
var mper;
var proj;
function DrawScene() {
    console.log(scene);
    nper = new Matrix(4,4);
    mper = new Matrix(4,4);
    proj = new Matrix(4,4);
    proj.values = [[view.width/2, 0,             0, view.width/2],
                   [0,            view.height/2, 0, view.height/2],
                   [0,            0,             1, 0],
                   [0,            0,             0, 1]];
    if ( scene.view.type == 'perspective')
    {
        Mat4x4Projection(nper, scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        Mat4x4MPer(mper);
    } else {
        Mat4x4Parallel(nper, scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        Mat4x4MPar(mper);
    }
    console.log(nper, mper);

    var vert = [];
    for(i = 0; i < scene.models.length; i++)
    {
        vert.push([]);
        for(var j = 0; j < scene.models[i].vertices.length; j++) {
            vert[i].push(Matrix.multiply([nper, scene.models[i].vertices[j]]));
        }
    }

    for(var i = 0; i < scene.models.length; i++) {
        for(var j = 0; j < scene.models[i].edges.length; j++) {
            for(var k = 0; k < scene.models[i].edges[j].length - 1; k++) {
                var ind0 = scene.models[i].edges[j][k];
                var ind1 = scene.models[i].edges[j][k+1];
                var line;
  
                if(scene.view.type === 'perspective'){
                    line = perclip(vert[i][ind0], vert[i][ind1]);
                } else {
                    line = parclip(vert[i][ind0], vert[i][ind1]);
                }
  
                if (line != null) {
                    var pt0 = Matrix.multiply([proj, mper, line.pt0]);
                    var pt1 = Matrix.multiply([proj, mper, line.pt1]);
  
                    DrawLineP(pt0, pt1, '#4287f5');
                }
            }
        }
    }
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
            scene.view.prp.x = scene.view.prp.x - 1;
            scene.view.srp.x = scene.view.srp.x - 1;
            console.log("left");
            break;
        case 38: // UP Arrow
            scene.view.prp.y = scene.view.prp.y + 1;
            scene.view.srp.y = scene.view.srp.y + 1;
            console.log("up");
            break;
        case 39: // RIGHT Arrow
            scene.view.prp.x = scene.view.prp.x + 1;
            scene.view.srp.x = scene.view.srp.x + 1;
            console.log("right");
            break;
        case 40: // DOWN Arrow
            scene.view.prp.y = scene.view.prp.y - 1;
            scene.view.srp.y = scene.view.srp.y - 1;
            console.log("down");
            break;

    }
}

//draw line for points, not coords
function DrawLineP(pt0, pt1, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    // Change to cartesian points
    pt0.x = pt0.x/pt0.w;
    pt0.y = pt0.y/pt0.w;
    pt1.x = pt1.x/pt1.w;
    pt1.y = pt1.y/pt1.w;
    ctx.moveTo(pt0.x, pt0.y);
    ctx.lineTo(pt1.x, pt1.y);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.fillRect(pt0.x - 3, pt0.y - 3, 6, 6);
    ctx.fillRect(pt1.x - 3, pt1.y - 3, 6, 6);
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

function OutcodePer(pt) {
    var outcode = 0;
    var zMin = -scene.view.clip[4]/scene.view.clip[5];

    if (pt.x < pt.z) outcode += LEFT;
    else if (pt.x > -pt.z) outcode += RIGHT;
    if (pt.y < pt.z) outcode += BOTTOM;
    else if (pt.y > -pt.z) outcode += TOP;
    if (pt.z > zMin) outcode += NEAR;
    else if (pt.z < -1) outcode += FAR;

    return outcode;
}

function OutcodePar(pt) {
    var outcode = 0;

    if (pt.x < -1) outcode += LEFT;
    else if (pt.x > 1) outcode += RIGHT;
    if (pt.y < -1) outcode += BOTTOM;
    else if (pt.y > 1) outcode += TOP;
    if (pt.z > 0) outcode += NEAR;
    else if (pt.z < -1) outcode += FAR;

    return outcode;
}

//recursion sucks

/*function percline(pt0, pt1) {
    var at0 = OutcodePer(pt0);
    var at1 = OutcodePer(pt1);

    if ((at0 | at1) === 0) { // once both line endpoints are inside view, return the points
        return { pt0: pt0, pt1: pt1};
    } else if ((at0 & at1) !== 0) { // if line is outside view, return null
        return null;
    } else {
        var cp = new Vector4();
        var hp = new Vector4();
        var np = new Vector4();
        var rp;
        var t;
        var at;

        //get endpoint outside view
        if (at0 > 0) {
            cp = new Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
            hp = new Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
            at = at0;
        } else if (at1 > 0) {
            cp = new Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
            hp = new Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
            at = at1;
        }

        var xchange = (cp.x - hp.x);
        var ychange = (cp.y - hp.y);
        var zchange = (cp.z - hp.z);
        var zMin = -1 * (schene.view.clip[4]/scene.view.clip[5]);

        //find first bit set to 1 and select view edge
        if ((at - 32) >= 0){
            t = ( -cp.x+cp.z) / (xchange-zchange);
            at -= 32;
        } else if ((at - 16) >= 0){
            t = ( cp.x+cp.z) / (-xchange-zchange);
            at -= 16;
        } else if ((at - 8) >= 0) {
            t = ( -cp.y+cp.z) / (ychange-zchange);
            at -= 8;
        } else if ((at - 4) >= 0) {
            t = (cp.y+cp.z) / (-ychange-zchange);
            at -= 4;
        } else if ((at - 2) >= 0) {
            t = (cp.z-zMin) / (-zchange);
            at -= 2;
        } else {
            t = (-ep0.z-1) / (changeZ);
            at -= 1;
        }

        //find new point at view edge
        np.x = cp.x + t * xchange;
        np.y = cp.y + t * ychange;
        np.z = cp.z + t * zchange;

        rp = new Vector4(np.x, np.y, np.z, cp.w);
        //replace endpoint and loop recursively
        return cline(rp, hp, view);
    }
}

function parcline(pt0, pt1, view) {
    var at0 = OutcodePar(pt0, view);
    var at1 = OutcodePar(pt1, view);

    if ((at0 | at1) === 0) { // once both line endpoints are inside view, return the points
        return { pt0: pt0, pt1: pt1};
    } else if ((at0 & at1) !== 0) { // if line is outside view, return null
        return null;
    } else {
        var cp = new Vector4();
        var hp = new Vector4();
        var np = new Vector4();
        var rp;
        var t;
        var at;

        //get endpoint outside view
        if (at0 > 0) {
            cp = new Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
            hp = new Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
            at = at0;
        } else if (at1 > 0) {
            cp = new Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
            hp = new Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
            at = at1;
        }

        var xchange = (cp.x - hp.x);
        var ychange = (cp.y - hp.y);
        var zchange = (cp.z - hp.z);
        var zMin = -1 * (schene.view.clip[4]/scene.view.clip[5]);

        //find first bit set to 1 and select view edge
        if ((at - 32) >= 0){
            t = (-1 -cp.x) / xchange;
            at -= 32;
        } else if ((at - 16) >= 0){
            t = (1 -cp.x) / xchange;
            at -= 16;
        } else if ((at - 8) >= 0) {
            t = (-1 -cp.y) / ychange;
            at -= 8;
        } else if ((at - 4) >= 0) {
            t = (1 -cp.y) / ychange;
            at -= 4;
        } else if ((at - 2) >= 0) {
            t = (0 -cp.z) / zchange;
            at -= 2;
        } else {
            t = (1 -cp.z) / zchange;
            at -= 1;
        }

        //find new point at view edge
        np.x = cp.x + t * xchange;
        np.y = cp.y + t * ychange;
        np.z = cp.z + t * zchange;

        rp = new Vector4(np.x, np.y, np.z, cp.w);
        //replace endpoint and loop recursively
        return cline(rp, hp, view);
    }
}*/

function parclip(pt0, pt1) {
    var end = false;
    var result = null;
    var ep0 = new Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
    var ep1 = new Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
    var out0;
    var out1;
    var changeout;
    var t;
    while(!end) {
        out0 = OutcodePar(ep0);
        out1 = OutcodePar(ep1);

        if((out0 | out1) === 0) {
            end = true;
            result = {pt0: ep0, pt1: ep1};
        } else if((out0 & out1) !== 0) {
            end = true;
        } else {
            if(out0 !== 0) {
                changeout = out0;
            } else {
                changeout = out1;
            }

            if(changeout >= LEFT) {
                t = (-1 - ep0.x) / (ep1.x - ep0.x);
            }
            else if(changeout >= RIGHT) {
                t = (1 - ep0.x) / (ep1.x - ep0.x);
            } else if(changeout >= BOTTOM) {
                t = (-1 - ep0.y) / (ep1.y - ep0.y);
            } else if(changeout >= TOP){
                t = (1 - ep0.y) / (ep1.y - ep0.y);
            } else if(changeout >= NEAR) {
                t = (0 - ep0.z) / (ep1.z - ep0.z);
            } else {
                t = (-1 - ep0.z) / (ep1.z - ep0.z);
            }

            if(changeout === out0) {
                ep0.x = ep0.x + t * (ep1.x - ep0.x);
                ep0.y = ep0.y + t * (ep1.y - ep0.y);
                ep0.z = ep0.z + t * (ep1.z - ep0.z);
            } else {
                ep1.x = ep0.x + t * (ep1.x - ep0.x);
                ep1.y = ep0.y + t * (ep1.y - ep0.y);
                ep1.z = ep0.z + t * (ep1.z - ep0.z);
            }
        }
    }
    return result;
}

function perclip(pt0, pt1) {
    var done = false;
    var result = null;
    var ep0 = new Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
    var ep1 = new Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
    var out0;
    var out1;
    var changeout;
    var t;
    while(!done) {
        out0 = OutcodePer(ep0);
        out1 = OutcodePer(ep1);
        if((out0 | out1) === 0) {
            done = true;
            result = {pt0: ep0, pt1: ep1};
        } else if((out0 & out1) !== 0) {
            done = true;
        } else {
            if(out0 !== 0) {
                changeout = out0;
            } else {
                changeout = out1;
            }

            var changeX = ep1.x-ep0.x;
            var changeY = ep1.y-ep0.y;
            var changeZ = ep1.z-ep0.z;
            var zMin = -scene.view.clip[4]/scene.view.clip[5];

            if(changeout >= LEFT) {
                t = ( -ep0.x+ep0.z) / (changeX-changeZ);
            } else if(changeout >= RIGHT) {
                t = ( ep0.x+ep0.z) / (-changeX-changeZ);
            } else if(changeout >= BOTTOM) {
                t = ( -ep0.y+ep0.z) / (changeY-changeZ);
            } else if(changeout >= TOP){
                t = (ep0.y+ep0.z) / (-changeY-changeZ);
            } else if(changeout >= NEAR) {
                t = (ep0.z-zMin) / (-changeZ);
            } else {
                t = (-ep0.z-1) / (changeZ);
            }

            if(changeout === out0) {
                ep0.x = ep0.x + t * (ep1.x - ep0.x);
                ep0.y = ep0.y + t * (ep1.y - ep0.y);
                ep0.z = ep0.z + t * (ep1.z - ep0.z);
            } else {
                ep1.x = ep0.x + t * (ep1.x - ep0.x);
                ep1.y = ep0.y + t * (ep1.y - ep0.y);
                ep1.z = ep0.z + t * (ep1.z - ep0.z);
            }
        }
    }
    return result;
}

