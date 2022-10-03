class Ball {
  constructor({ key, color, size, position, scale }) {
		this._key = key;
		this._color = color;
		this._position = position;
		this._size = size;

		this._scale = scale || 0;
  }

	render(ctx) {
		const renderSize = this._size * this._scale;
		const renderPosition = {
			x: this._position.x + (this._size - renderSize) / 2,
			y: this._position.y + (this._size - renderSize) / 2,
		}

		const ballGradientOffset = renderSize * 0.33;
		const gradient = ctx.createRadialGradient(renderPosition.x + ballGradientOffset, renderPosition.y + ballGradientOffset, 0, renderPosition.x + ballGradientOffset, renderPosition.y + ballGradientOffset, renderSize * 0.72);
		gradient.addColorStop(0, this._color[0]);
		gradient.addColorStop(.5, this._color[1]);
		gradient.addColorStop(1, this._color[2]);
		ctx.fillStyle = gradient;
		renderRoundedRect(ctx, renderPosition.x, renderPosition.y, renderSize, renderSize, renderSize / 2);
	}
}

Ball.COLORS = {
	bl: ['#E5E8FF', '#5163FF', '#2A359C'],
	br: ['#FFEBE5', '#F29048', '#8E441B'],
	gr: ['#E5FFE9', '#51CE46', '#197E2F'],
	pnk: ['#FFE5FC', '#EC39FC', '#B2229B'],
	rd: ['#FFCAB9', '#E74724', '#991F1F'],
	sea: ['#E5FFF9', '#51E0FF', '#2391B4'],
	yel: ['#FFF9E5', '#FCDD39', '#B1881E'],
}

