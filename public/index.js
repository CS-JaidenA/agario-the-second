// establish connection

const ws = new WebSocket("ws://localhost:3000");

/** @type {import("../component.world").WorldPackageExtendedObject} */
let pack = {};
let uuid = '';

ws.addEventListener("message", e => {
	const message = JSON.parse(e.data);

	console.log(100, message.pack, message.uuid);
	console.log(200, pack);

	if (message.pack)
		pack = { ...pack, ...message.pack };

	if (message.uuid)
		uuid = uuid;

	console.log(300, pack);
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

function draw() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	// draw grid

	ctx.lineWidth = 2;
	ctx.strokeStyle = "red";

	for (let i = pack.width - 1; i > 0; i++) {
		const offset = cnv.width / pack.width * i;

		ctx.beginPath();
		ctx.moveTo(offset, 0);
		ctx.lineTo(offset, cnv.height);
		ctx.stroke();
	}

	requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
