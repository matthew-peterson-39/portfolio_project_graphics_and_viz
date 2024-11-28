const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  console.error("WebGL not supported");
  throw new Error("WebGL not supported");
}

// Add vertex and fragment shader source code
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

const fragmentShaderSource = `
    varying lowp vec4 vColor;
    void main(void) {
        gl_FragColor = vColor;
    }
`;

// Add shader creation utility functions
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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

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

const triangleData = {
  positions: [
      -0.5, -0.5, -3.0,  // First vertex
       0.5, -0.5, -3.0,  // Second vertex
       0.0,  0.5, -3.0   // Third vertex
  ],
  colors: [
      1.0, 0.0, 0.0, 1.0,  // Red
      0.0, 1.0, 0.0, 1.0,  // Green
      0.0, 0.0, 1.0, 1.0   // Blue
  ]
};

// Create and bind position buffer
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(triangleData.positions),
  gl.STATIC_DRAW
);

// Create and bind color buffer
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(triangleData.colors),
  gl.STATIC_DRAW
);

