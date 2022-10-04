class ActiveBall extends Ball {
  constructor({ key, color, size, position, scale, birthDelay, cell, cellSize, cellsBetweenSize, stepSize, field, score }) {
		super({ key, color, size, position, scale });
		this._cellSize = cellSize;
		this._cellsBetweenSize = cellsBetweenSize;
		this._stepSize = stepSize;
		this._field = field;
		this._score = score;
		this._birthDelay = birthDelay;
		this._destroyDelay = 0;

		this._stage = Ball.STAGES[1];

		this._startBirthTimestamp = 0;
    this._startMovingTimestamp = 0;
		this._startDestroyingTimestamp = 0;

    this._path = null;
    this._cell = cell;
  }

	update(time) {
		const { timestamp } = time;

		if (this._stage === Ball.STAGES[1]) this._updateBirth(timestamp);
    if (this._stage === Ball.STAGES[3]) this._updateMoving(timestamp);
		if (this._stage === Ball.STAGES[4]) this._updateDestroing(timestamp);
	}

  _updateMoving(timestamp) {
    if (!this._startMovingTimestamp) this._startMovingTimestamp = timestamp;

    const movingTime = timestamp - this._startMovingTimestamp;
    const duration = (this._path.length - 1) * Ball.MOVE_SPEED_PER_CELL;
		const stepLength = Field.CELL_SIZE_SCALE_FACTOR * this._stepSize.common + this._cellsBetweenSize.common;
    const pathLength = (this._path.length - 1) * stepLength;

		if (movingTime >= duration) {
			this._position.x = this._path[this._path.length - 1].position.x + (this._cellSize.common - this._size) / 2;
			this._position.y = this._path[this._path.length - 1].position.y + (this._cellSize.common - this._size) / 2;
      this._startMovingTimestamp = 0;
      this._stage = Ball.STAGES[2];
			this._path[this._path.length - 1].ball = this;
			const sequences = this._field.findSequences([this._path[this._path.length - 1]]);
			this._path = null;
			if (sequences.length) {
				this._field.clearSequences(sequences);
				this._score.addNewPoints(sequences.length * Field.SCORE_PER_BALL);
			} else this._field.spawnBalls();
    } else if (movingTime > 0) {
			const progress = movingTime / duration * pathLength;
			const index = Math.floor(progress / stepLength);
			const addition = (progress % stepLength) / stepLength;
			const cell = this._path[index];
			const nextCell = this._path[index + 1];
			this._position.x = cell.position.x + (nextCell.position.x - cell.position.x) * addition + (this._cellSize.common - this._size) / 2;
			this._position.y = cell.position.y + (nextCell.position.y - cell.position.y) * addition + (this._cellSize.common - this._size) / 2;
    }
  }

	_updateBirth(timestamp) {
		if (!this._startBirthTimestamp) this._startBirthTimestamp = timestamp + this._birthDelay;

		const birthTime = timestamp - this._startBirthTimestamp;

		if (birthTime >= Ball.BIRTH_SPEED) {
			this._scale = 1;
			this._stage = Ball.STAGES[2];
		} else if (birthTime > 0) {
			const { x, y } = calcFourPointsBezier(Ball.BIRTH_X, Ball.BIRTH_Y, birthTime / Ball.BIRTH_SPEED);
			this._scale = (x + y) / 2;
		}
	}

	_updateDestroing(timestamp) {
		if (!this._startDestroyingTimestamp) this._startDestroyingTimestamp = timestamp + this._destroyDelay;

		const destroyingTime = timestamp - this._startDestroyingTimestamp;

		if (destroyingTime >= Ball.DESTROYING_SPEED) {
			this._scale = 0;
			this._stage = Ball.STAGES[5];
		} else if (destroyingTime > 0) {
			const { x, y } = calcFourPointsBezier(Ball.DESTROY_X, Ball.DESTROY_Y, destroyingTime / Ball.DESTROYING_SPEED);
			this._scale = (x + y) / 2;
		}
	}

  move(path) {
    this._path = path;
    this._stage = Ball.STAGES[3];
  }

	destroy(delay) {
		this._destroyDelay = delay;
		this._stage = Ball.STAGES[4];
	}
}