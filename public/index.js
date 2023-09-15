import draw from "./manager@draw.js";
import mouse from "./manager@mouse.js";
import colours from "./manager@colours.js";
import components from "./components.js";

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = cnv.getContext("2d");

// scale canvas

window.addEventListener("resize", () => {
	cnv.width	= Math.floor(window.innerWidth * window.devicePixelRatio);
	cnv.height	= Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));

// setup

components.init(cnv, ctx);

const player = new components.Player(canvas.width / 2, canvas.height / 2, 100, colours.random());

requestAnimationFrame(update);

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	// x and y coordinates

	const mouseX = mouse.x * canvas.width;
	const mouseY = mouse.y * canvas.height;

	player.draw();

	requestAnimationFrame(update);
}
