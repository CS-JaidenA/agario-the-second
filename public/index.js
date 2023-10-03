// establish connection

const ws = new WebSocket("ws://localhost:3000");

/** @type {string} */
let uuid;

/** @type {import("../component.world").WorldPackage} */
let world;

ws.addEventListener("message", e => {
	/** @type {import("..").Message} */
	const message = JSON.parse(e.data);

	if (message.uuid)  uuid  = uuid;
	if (message.world) world = world;
});

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

// scale canvas

window.addEventListener("resize", () => {
	cnv.width	= Math.floor(window.innerWidth * window.devicePixelRatio);
	cnv.height	= Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));

// draw canvas

function update() {
	requestAnimationFrame(update);
}
