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

game.init(cnv, ctx);
requestAnimationFrame(update);

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);
	game.world.draw();

	requestAnimationFrame(update);
}
