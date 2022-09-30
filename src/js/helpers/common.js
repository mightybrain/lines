function renderRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}

function calcTextMetrics(ctx, fontSize, text) {
  ctx.font = `${fontSize}px LuckiestGuy`;
  const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text);
  return { textWidth: width, textHeight: actualBoundingBoxAscent + actualBoundingBoxDescent }
}

function getRandomFromRange(from, to) {
  return from === to ? from : from + Math.floor(Math.random() * (to - from));
}

function coordsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function calcFourPointsBezier(x, y, time) {
  return {
    x: Math.pow(1 - time, 3) * x[0] + 3 * Math.pow(1 - time, 2) * time * x[1] + 3 * (1 - time) * Math.pow(time, 2) * x[2] + Math.pow(time, 3) * x[3],
    y: Math.pow(1 - time, 3) * y[0] + 3 * Math.pow(1 - time, 2) * time * y[1] + 3 * (1 - time) * Math.pow(time, 2) * y[2] + Math.pow(time, 3) * y[3],
  }
}