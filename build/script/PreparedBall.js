class PreparedBall {
  constructor({ key, color, size, position, birthDelay }) {
		this._key = key;
		this._color = color;
		this._position = position;
		this._size = size;
		this._birthDelay = birthDelay;

		this._scale = 0;

		this._stage = PreparedBall.STAGES[1];

		this._startBirthTimestamp = 0;
  }

	update(time) {
		const { timestamp } = time;

    if (this._stage === PreparedBall.STAGES[2]) return;

    if (!this._startBirthTimestamp) this._startBirthTimestamp = timestamp + this._birthDelay;

		const birthTime = timestamp - this._startBirthTimestamp;

		if (birthTime > 0 && birthTime < PreparedBall.BIRTH_SPEED) {
			const { x, y } = calcFourPointsBezier(PreparedBall.BIRTH_X, PreparedBall.BIRTH_Y, birthTime / PreparedBall.BIRTH_SPEED);
			this._scale = (x + y) / 2;
		} else if (birthTime >= PreparedBall.BIRTH_SPEED) {
			this._scale = 1;
			this._stage = PreparedBall.STAGES[2];
		}
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

	getColorAndKey() {
		return {
			key: this._key,
			color: this._color,
		}
	}

	setSize(size) {
		this._size = size;
	}

	setPosition(position) {
		this._position.x = position.x;
		this._position.y = position.y;
	}
}

PreparedBall.STAGES = {
	1: 'birth',
	2: 'static',
}

PreparedBall.SIZE_SCALE_FACTOR = 12;
PreparedBall.BIRTH_SPEED = 500;
PreparedBall.BIRTH_X = [0, 0.75, 0.5, 1];
PreparedBall.BIRTH_Y = [0, 0, 2.5, 1];