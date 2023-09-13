import draw from "./manager@draw.js";
import mouse from "./manager@mouse.js";
import components from "./components.js";

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = cnv.getContext("2d");

draw.init(ctx);

cnv.width = 1000;
cnv.height = 1000;

const player = new components.Player(mouse.x, mouse.y, 50, "red");

requestAnimationFrame(update);

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	draw.circle(mouse.x, mouse.y, player.radius, "red");

	requestAnimationFrame(update);
}

function setCanvasScale() {
	cnv.width	= Math.floor(window.innerWidth * window.devicePixelRatio);
	cnv.height	= Math.floor(window.innerHeight * window.devicePixelRatio);
}

window.addEventListener("resize", setCanvasScale);
setCanvasScale();
