// Global WebGL context variable
let gl = null;

// Initialize WebGL context
function initGL() {
  const canvas = document.querySelector("#glCanvas");

  // Try to get WebGL 2 context first, fall back to WebGL 1
  gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return false;
  }

  // Set clear color to light gray
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  // Clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  return true;
}

// Main function to start the program
function main() {
  if (!initGL()) {
    return;
  }
  // Future rendering code will go here
}

// Start the program when page loads
window.onload = main;
