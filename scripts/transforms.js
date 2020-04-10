// set values of mat4x4 to the parallel projection / view matrix
function Mat4x4Parallel(mat4x4, prp, srp, vup, clip) {
    // 1. translate PRP to origin
    var transprp = new Matrix(4,4);
    Mat4x4Translate(transprp, -prp.x, -prp.y, -prp.z);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    var rotatevrc = new Matrix(4,4);
    var n = prp.subtract(srp);
    n.normalize();
    var u = vup.cross(n);
    u.normalize();
    var v = n.cross(u);
    rotatevrc.values = [[u.x, u.y, u.z, 0],
                        [v.x, v.y, v.z, 0],
                        [n.x, n.y, n.z, 0],
                        [0, 0, 0, 1]];
    // 3. shear such that CW is on the z-axis
    var shearcw = new Matrix(4,4);
    var cw = Vector3((clip[0] + clip[1]) / 2, (clip[2] + clip[3])/2, -clip[4]);
    var DOP = cw;
    DOP.normalize();
    var shx = -DOP.x/DOP.z;
    var shy = -DOP.y/DOP.z;
    Mat4x4ShearXY(shearcw, shx, shy);
    // 4. translate near clipping plane to origin
    var transfc = new Matrix(4,4);
    Mat4x4Translate(transfc, 0, 0, clip[4]);
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    var viewscale = new Matrix(4,4);
    var sparx = 2/(clip[1]-clip[0]);
    var spary = 2/(clip[3]-clip[2]);
    var sparz = 1/(clip[5]-clip[4]);
    Mat4x4Scale(viewscale, sparx, spary, sparz);

    // ...
    var mult = [viewscale, transfc, shearcw, rotatevrc, transprp];
    var transform = Matrix.multiply(mult);
    mat4x4.values = transform.values;
}

// set values of mat4x4 to the parallel projection / view matrix
function Mat4x4Projection(mat4x4, prp, srp, vup, clip) {
    // 1. translate PRP to origin
    var transprp = new Matrix(4,4);
    Mat4x4Translate(transprp, -prp.x, -prp.y, -prp.z);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    var rotatevrc = new Matrix(4,4);
    var n = prp.subtract(srp);
    n.normalize();
    var u = vup.cross(n);
    u.normalize();
    var v = n.cross(u);
    rotatevrc.values = [[u.x, u.y, u.z, 0],
                        [v.x, v.y, v.z, 0],
                        [n.x, n.y, n.z, 0],
                        [0, 0, 0, 1]];
    // 3. shear such that CW is on the z-axis
    var shearcw = new Matrix(4,4);
    var cw = Vector3((clip[0]+clip[1])/2, (clip[2]+clip[3])/2, -clip[4]);
    var DOP = cw;
    cw.normalize();
    var shx = -DOP.x/DOP.z;
    var shy = -DOP.y/DOP.z;
    Mat4x4ShearXY(shearcw, shx, shy);
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    var viewscale = new Matrix(4,4);
    var sparx = (2*clip[4])/((clip[1]-clip[0])*clip[5]);
    var spary = (2*clip[4])/((clip[3]-clip[2])*clip[5]);
    var sparz = 1/clip[5];
    Mat4x4Scale(viewscale, sparx, spary, sparz);
    // ...
    var mult = [viewscale, shearcw, rotatevrc, transprp];
    var transform = Matrix.multiply(mult);
    mat4x4.values = transform.values;
}

// set values of mat4x4 to project a parallel image on the z=0 plane
function Mat4x4MPar(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 0, 0],
                     [0, 0, 0, 1]];
}

// set values of mat4x4 to project a perspective image on the z=-1 plane
function Mat4x4MPer(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, -1, 0]];
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of mat4x4 to the identity matrix
function Mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of mat4x4 to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of mat4x4 to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx,  0,  0, 0],
                     [ 0, sy,  0, 0],
                     [ 0,  0, sz, 0],
                     [ 0,  0,  0, 1]];
}

// set values of mat4x4 to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [
        [1,0,0,0],
        [0,Math.cos(theta * (Math.PI/180)),(-1*Math.sin(theta * (Math.PI/180))),0],
        [0,Math.sin(theta * (Math.PI/180)),Math.cos(theta * (Math.PI/180)),0],
        [0,0,0,1]
    ];
}

// set values of mat4x4 to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [
        [Math.cos(theta * (Math.PI/180)),0,Math.sin(theta * (Math.PI/180)),0],
        [0,1,0,0],
        [(-1*Math.sin(theta * (Math.PI/180))),0,Math.cos(theta * (Math.PI/180)),0],
        [0,0,0,1]
    ];
}

// set values of mat4x4 to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [
        [Math.cos(theta * (Math.PI/180)),(-1*Math.sin(theta * (Math.PI/180))),0,0],
        [Math.sin(theta * (Math.PI/180)),Math.cos(theta * (Math.PI/180)),0,0],
        [0,0,1,0],
        [0,0,0,1]
    ];
}

// set values of mat4x4 to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0,   1, 0],
                     [0, 0,   0, 1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
