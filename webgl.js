const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  console.error("WebGL not supported");
  throw new Error("WebGL not supported");
}