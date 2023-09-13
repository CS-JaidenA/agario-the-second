/**
 * @namespace
 * @property {number} x
 * @property {number} y
 */
let mouse = {
    x: 0,
    y: 0,
};

addEventListener("mousemove", function({clientX, clientY}) {
    mouse.x = clientX;
    mouse.y = clientY;
});

export default mouse;
