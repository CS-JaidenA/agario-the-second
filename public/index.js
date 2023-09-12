/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("board");

const ctx = canvas.getContext("2d");
window.requestAnimationFrame(update);

function update() {

    window.requestAnimationFrame(update);
}
