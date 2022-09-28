class Ball {
  constructor({ key, color, size, position }) {
		this._key = key;
		this._color = color;
		this._position = position;
		this._size = size;
  }

	setSize(size) {
		this._size = size;
	}

	setPosition(position) {
		this._position.x = position.x;
		this._position.y = position.y;
	}

	render(ctx) {
		const ballGradientOffset = this._size * 0.33;
		const gradient = ctx.createRadialGradient(this._position.x + ballGradientOffset, this._position.y + ballGradientOffset, 0, this._position.x + ballGradientOffset, this._position.y + ballGradientOffset, this._size * 0.72);
		gradient.addColorStop(0, this._color[0]);
		gradient.addColorStop(.5, this._color[1]);
		gradient.addColorStop(1, this._color[2]);
		ctx.fillStyle = gradient;
		renderRoundedRect(ctx, this._position.x, this._position.y, this._size, this._size, this._size / 2);
	}

	getProps() {
		return {
			key: this._key,
			color: this._color,
			size: this._size,
			position: this._position,
		}
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

Ball.SIZE_SCALE_FACTOR = 12;