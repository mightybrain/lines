class PreparedBall extends Ball {
  constructor({ key, color, size, position, scale, birthDelay }) {
		super({ key, color, size, position, scale });
		this._birthDelay = birthDelay;

		this._startBirthTimestamp = 0;
		this._stage = Ball.STAGES[1];
  }

	update(time) {
		const { timestamp } = time;

		if (this._stage === Ball.STAGES[1]) this._updateBirth(timestamp);
	}

	_updateBirth(timestamp) {
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

	setSize(size) {
		this._size = size;
	}

	setPosition(position) {
		this._position.x = position.x;
		this._position.y = position.y;
	}
}

