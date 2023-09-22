/**
 * @namespace
 * @property {number} x - mouse clientX coordinate as decimal percentage
 * @property {number} y - mouse clientY coordinate as decimal percentage
 */
let mouse = {
    x: 0,
    y: 0,
};

addEventListener("mousemove", function({clientX, clientY}) {
    // save coordinates as decimal percentages

    mouse.x = clientX / document.documentElement.clientWidth;
    mouse.y = clientY / document.documentElement.clientHeight;
});
