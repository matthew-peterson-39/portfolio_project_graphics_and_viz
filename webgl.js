// Initialize WebGL context and handle browser support
const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  console.error("WebGL not supported");
  throw new Error("WebGL not supported");
}

// Shader Definitions
// Vertex shader handles position and color data, applying model-view and projection transformations
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
`;

// Fragment shader determines the color of each pixel based on interpolated vertex colors
const fragmentShaderSource = `
    varying lowp vec4 vColor;
    void main(void) {
        gl_FragColor = vColor;
    }
`;

// Shader Compilation Utilities
// Creates and compiles a shader of the specified type from source code
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
  }
  return shader;
}

// Links vertex and fragment shaders into a complete WebGL program
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return null;
  }
  return program;
}

// Initialize shaders and create WebGL program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Store locations of attributes and uniforms for efficient access during rendering
const programInfo = {
  attribLocations: {
      vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(program, "aVertexColor"),
  },
  uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
  },
};

// Define geometry and color data for multiple triangles
// Each triangle is defined with position vertices and corresponding colors
// The triangles are positioned at different locations to show overlapping
const trianglesData = [
    {
        positions: [
            -0.5, -0.5, -3.0,  // First vertex (bottom-left)
             0.5, -0.5, -3.0,  // Second vertex (bottom-right)
             0.0,  0.5, -3.0   // Third vertex (top-center)
        ],
        colors: [
            1.0, 0.0, 0.0, 1.0,  // Red (bottom-left)
            0.0, 1.0, 0.0, 1.0,  // Green (bottom-right)
            0.0, 0.0, 1.0, 1.0   // Blue (top-center)
        ]
    },
    {
        positions: [
            -0.3, -0.3, -2.0,  // First vertex (bottom-left)
             0.7, -0.3, -2.0,  // Second vertex (bottom-right)
             0.2,  0.7, -2.0   // Third vertex (top-center)
        ],
        colors: [
            0.0, 0.0, 1.0, 1.0,  // Blue (bottom-left)
            0.0, 1.0, 1.0, 1.0,  // Cyan (bottom-right)
            1.0, 0.0, 0.0, 1.0   // Red (top-center)
        ]
    }
];

// Create and initialize WebGL buffers for each triangle
const buffers = trianglesData.map(triangleData => {
    // Create and populate position buffer for this triangle
    const positions = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positions);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(triangleData.positions),
        gl.STATIC_DRAW
    );

    // Create and populate color buffer for this triangle
    const colors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colors);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(triangleData.colors),
        gl.STATIC_DRAW
    );

    return {
        position: positions,
        color: colors,
        vertexCount: triangleData.positions.length / 3  // Number of vertices in this triangle
    };
});

// Main rendering function
function drawScene() {
    // Clear the canvas and prepare for rendering
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up perspective projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(
        projectionMatrix,
        (45 * Math.PI) / 180,  // 45 degree field of view
        canvas.width / canvas.height,
        0.1,  // near clipping plane
        100.0  // far clipping plane
    );

    // Set up model-view matrix for positioning the triangles in 3D space
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

    // Activate our shader program
    gl.useProgram(program);

    // Render each triangle in the scene
    buffers.forEach(buffer => {
        // Configure vertex position attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            3,  // 3 components per vertex (x, y, z)
            gl.FLOAT,
            false,
            0,
            0
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        // Configure vertex color attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            4,  // 4 components per color (r, g, b, a)
            gl.FLOAT,
            false,
            0,
            0
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

        // Update shader uniforms with current transformation matrices
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );

        // Render this triangle
        gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount);
    });
}

// Start rendering
drawScene();