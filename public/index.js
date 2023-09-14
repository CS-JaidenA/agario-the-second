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

	for (let blob of player.blobs) {
		// distance between blob and mouse coordinates

		const distanceX = Math.abs(mouseX - blob.x);
		const distanceY = Math.abs(mouseY - blob.y);

		// speeds adjusted so blob coords meet mouse coords at same time

		let adjustedSpeedX;
		let adjustedSpeedY;

		// stop moving the player if the player is about centered

		if (distanceX < 2 && distanceY < 2) {
			adjustedSpeedX = 0;
			adjustedSpeedY = 0;
		} else {
			adjustedSpeedX = distanceX > distanceY ? speed : speed * distanceX / distanceY;
			adjustedSpeedY = distanceY > distanceX ? speed : speed * distanceY / distanceX;
		}

		blob.x += adjustedSpeedX * (mouse.x * canvas.width > blob.x ? 1 : -1);
		blob.y += adjustedSpeedY * (mouse.y * canvas.height > blob.y ? 1 : -1);

		draw.circle(blob.x, blob.y, blob.radius, player.colour);
	}

	requestAnimationFrame(update);
}

// scale canvas

window.addEventListener("resize", () => {
	cnv.width	= Math.floor(window.innerWidth * window.devicePixelRatio);
	cnv.height	= Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));
