'use strict';

const draw = {};

draw.circ = (x, y, radius, colour) => {
	const fillStyle = ctx.fillStyle;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);

	ctx.fillStyle = colour;
	ctx.fill();

	ctx.fillStyle = fillStyle;
};

draw.rect = (x, y, width, height, colour) => {
	const fillStyle = ctx.fillStyle;

	ctx.rect(x, y, width, height);

	ctx.fillStyle = colour;
	ctx.fill();

	ctx.fillStyle = fillStyle;
};

draw.line = (x1, y1, x2, y2, colour, thickness) => {
	const strokeStyle = ctx.strokeStyle;
	const lineWidth   = ctx.lineWidth;

	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);

	ctx.strokeStyle = colour;
	ctx.lineWidth   = thickness;
	ctx.stroke();

	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth   = lineWidth;
};

draw.grid = bounds => {
	const x = {
		border: game.pack.height * game.pack.gridBoxSize,
		offset: cnv.width / 2 - bounds.x,
	};

	const y = {
		border: game.pack.height * game.pack.gridBoxSize,
		offset: cnv.height / 2 - bounds.y,
	};

	// draw grid border

	const grid = {
		bottom: y.offset + game.pack.height * game.pack.gridBoxSize,
		right:  x.offset + game.pack.width  * game.pack.gridBoxSize,
		left:   x.offset,
		top:    y.offset,
	};

	draw.line(grid.left,  grid.top,    grid.left,  grid.bottom, ...gridBox.style);
	draw.line(grid.left,  grid.top,    grid.right, grid.top,    ...gridBox.style);
	draw.line(grid.right, grid.top,    grid.right, grid.bottom, ...gridBox.style);
	draw.line(grid.left,  grid.bottom, grid.right, grid.bottom, ...gridBox.style);

	// draw horizontal grid lines

	for (let i = 1; i < game.pack.height; i++) {
		const y = grid.top + game.pack.gridBoxSize * i;

		if (y > 0 && y < cnv.height)
			draw.line(grid.left, y, grid.right, y, ...gridBox.style);
	}

	// draw vertical grid lines

	for (let i = 1; i < game.pack.width; i++) {
		const x = grid.left + game.pack.gridBoxSize * i;

		if (x > 0 && x < cnv.width)
			draw.line(x, grid.top, x, grid.bottom, ...gridBox.style);
	}
};
