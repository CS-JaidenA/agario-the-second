const mouse = {
	xPercentage: 50,
	yPercentage: 50,
};

addEventListener("mousemove", function({ clientX, clientY }) {
	mouse.x = clientX / this.document.documentElement.clientWidth;
	mouse.y = clientY / this.document.documentElement.clientHeight;
});
