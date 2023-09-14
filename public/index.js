import draw from "./manager@draw.js";
import mouse from "./manager@mouse.js";
import colours from "./manager@colours.js";
import components from "./components.js";

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = cnv.getContext("2d");

// setup

draw.init(ctx);

const speed = 6;
const player = new components.Player(mouse.x * canvas.width, mouse.y * canvas.height, 50, colours.random());

requestAnimationFrame(update);

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	// x and y coordinates

	const mouseX = mouse.x * canvas.width;
	const mouseY = mouse.y * canvas.height;

	// distance between player and mouse coordinates

	const distanceX = Math.abs(mouseX - player.x);
	const distanceY = Math.abs(mouseY - player.y);

	// speeds adjusted so player coords meet mouse coords at same time

	let adjustedSpeedX;
	let adjustedSpeedY;

	// stop moving the player if the player is about centered

	if (distanceX < speed && distanceY < speed) {
		adjustedSpeedX = 0;
		adjustedSpeedY = 0;
	} else {
		adjustedSpeedX = distanceX > distanceY ? speed : speed * distanceX / distanceY;
		adjustedSpeedY = distanceY > distanceX ? speed : speed * distanceY / distanceX;
	}

	player.x += adjustedSpeedX * (mouse.x * canvas.width > player.x ? 1 : -1);
	player.y += adjustedSpeedY * (mouse.y * canvas.height > player.y ? 1 : -1);

	draw.circle(player.x, player.y, player.radius, player.colour);

	requestAnimationFrame(update);
}

// scale canvas

window.addEventListener("resize", () => {
	cnv.width	= Math.floor(window.innerWidth * window.devicePixelRatio);
	cnv.height	= Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));
