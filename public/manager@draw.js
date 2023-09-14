let ctx;

/**
 * @param {CanvasRenderingContext2D} context
 * @returns {undefined}
 */
function init(context) {
    ctx = context;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} colour
 * @returns {undefined}
 */
function circle(x, y, radius, colour) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    ctx.fillStyle = colour;
    ctx.fill();
}

export default { init, circle };
