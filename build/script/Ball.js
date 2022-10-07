class Ball {
	constructor({ key, color, size, position, scale = 0, birthDelay = 0 }) {
		this._key = key;
		this._color = color;
		this._position = position;
		this._size = size;
		this._scale = scale;
		this._birthDelay = birthDelay;
		this._destroyDelay = 0;

		this._startBirthTimestamp = 0;
		this._startDestroyingTimestamp = 0;

		this._stage = Ball.STAGES[1];
	}

	update(time) {
		if (this._stage === Ball.STAGES[1]) this._updateBirth(time);
		if (this._stage === Ball.STAGES[3]) this._updateDestroing(time);
	}

	_updateBirth({ timestamp }) {
		if (!this._startBirthTimestamp) this._startBirthTimestamp = timestamp + this._birthDelay;

		const birthTime = timestamp - this._startBirthTimestamp;

		if (birthTime >= Ball.BIRTH_SPEED) {
			this._stage = Ball.STAGES[2];
			this._scale = 1;
		} else if (birthTime > 0) {
			const { x, y } = calcFourPointsBezier(Ball.BIRTH_X, Ball.BIRTH_Y, birthTime / Ball.BIRTH_SPEED);
			this._scale = (x + y) / 2;
		}
	}

	_updateDestroing({ timestamp }) {
		if (!this._startDestroyingTimestamp) this._startDestroyingTimestamp = timestamp + this._destroyDelay;

		const destroyingTime = timestamp - this._startDestroyingTimestamp;

		if (destroyingTime >= Ball.DESTROYING_SPEED) {
			this._stage = Ball.STAGES[4];
			this._scale = 0;
		} else if (destroyingTime > 0) {
			const { x, y } = calcFourPointsBezier(Ball.DESTROY_X, Ball.DESTROY_Y, destroyingTime / Ball.DESTROYING_SPEED);
			this._scale = (x + y) / 2;
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

	setSize(size) {
		this._size = size;
	}

	setPosition(position) {
		this._position.x = position.x;
		this._position.y = position.y;
	}

	destroy(delay) {
		this._destroyDelay = delay;
		this._stage = Ball.STAGES[3];
	}

	getColorAndKey() {
		return {
			key: this._key,
			color: this._color,
		}
	}

	getKey() {
		return this._key;
	}

	getStage() {
		return this._stage;
	}

	getSize() {
		return this._size;
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

Ball.STAGES = {
	1: 'birth',
	2: 'static',
	3: 'destroying',
	4: 'destroyed',
}

Ball.SIZE_SCALE_FACTOR = 12;
Ball.BIRTH_SPEED = 500;
Ball.DESTROYING_SPEED = 500;
Ball.BIRTH_X = [0, 0.75, 0.5, 1];
Ball.BIRTH_Y = [0, 0, 2.5, 1];
Ball.DESTROY_X = [1, 0.5, 0.75, 0];
Ball.DESTROY_Y = [1, 2.5, 0, 0];