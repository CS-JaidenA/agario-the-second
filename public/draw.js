const draw = {};

draw.circ = (x, y, radius, colour) => {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);

	ctx.fillStyle = colour;
	ctx.fill();
};

draw.rect = (x, y, width, height, colour) => {
	ctx.rect(x, y, width, height);

	ctx.fillStyle = colour;
	ctx.fill();
};

draw.line = (x1, y1, x2, y2, colour, thickness) => {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);

	ctx.strokeStyle = colour;
	ctx.lineWidth   = thickness;
	ctx.stroke();
};

draw.grid = mainPlayerBlob => {
	const gridBox = {
		size:  40,
		style: ["#313131", 1],
	};

	const x = {
		border: game.pack.height * gridBox.size,
		offset: cnv.width / 2 - mainPlayerBlob.x * gridBox.size,
	};

	const y = {
		border: game.pack.height * gridBox.size,
		offset: cnv.height / 2 - mainPlayerBlob.y * gridBox.size,
	};

	// draw grid border

	const grid = {
		bottom: y.offset + game.pack.height * gridBox.size,
		right:  x.offset + game.pack.width  * gridBox.size,
		left:   x.offset,
		top:    y.offset,
	};

	draw.line(grid.left,  grid.top,    grid.left,  grid.bottom, ...gridBox.style);
	draw.line(grid.left,  grid.top,    grid.right, grid.top,    ...gridBox.style);
	draw.line(grid.right, grid.top,    grid.right, grid.bottom, ...gridBox.style);
	draw.line(grid.left,  grid.bottom, grid.right, grid.bottom, ...gridBox.style);

	// draw horizontal grid lines

	for (let i = 1; i < game.pack.height; i++) {
		const y = grid.top + gridBox.size * i;

		if (y > 0 && y < cnv.height)
			draw.line(grid.left, y, grid.right, y, ...gridBox.style);
	}

	// draw vertical grid lines

	for (let i = 1; i < game.pack.width; i++) {
		const x = grid.left + gridBox.size * i;

		if (x > 0 && x < cnv.width)
			draw.line(x, grid.top, x, grid.bottom, ...gridBox.style);
	}
};
