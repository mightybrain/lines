class ActiveBall {
  constructor({ key, color, size, position, birthDelay, map, cell, cellSize, stepSize, field }) {
		this._key = key;
		this._color = color;
		this._position = position;
		this._size = size;
		this._cellSize = cellSize;
		this._stepSize = stepSize;
		this._field = field;
		this._birthDelay = birthDelay;

		this._scale = 0;

		this._stage = ActiveBall.STAGES[1];

		this._startBirthTimestamp = 0;
    this._startMovingTimestamp = 0;
		this._startDestroyingTimestamp = 0;

    this._path = null;
    this._cell = cell;
    this._map = map;
  }

	update(time) {
		const { timestamp } = time;

		if (this._stage === ActiveBall.STAGES[1]) this._updateBirth(timestamp);
    if (this._stage === ActiveBall.STAGES[3]) this._updateMoving(timestamp);
		if (this._stage === ActiveBall.STAGES[4]) this._updateDestroing(timestamp);
	}

	_updateBirth(timestamp) {
		if (!this._startBirthTimestamp) this._startBirthTimestamp = timestamp + this._birthDelay;

		const birthTime = timestamp - this._startBirthTimestamp;

		if (birthTime > 0 && birthTime < ActiveBall.BIRTH_SPEED) {
			const { x, y } = calcFourPointsBezier(ActiveBall.BIRTH_X, ActiveBall.BIRTH_Y, birthTime / ActiveBall.BIRTH_SPEED);
			this._scale = (x + y) / 2;
		} else if (birthTime >= ActiveBall.BIRTH_SPEED) {
			this._scale = 1;
			this._stage = ActiveBall.STAGES[2];
		}
	}

  _updateMoving(timestamp) {
    if (!this._startMovingTimestamp) this._startMovingTimestamp = timestamp;

    const movingTime = timestamp - this._startMovingTimestamp;
    const duration = (this._path.length - 1) * ActiveBall.MOVE_SPEED_PER_CELL;
		const stepLength = Field.CELL_SIZE_SCALE_FACTOR * this._stepSize.common + Field.CELLS_BETWEEN_SIZE_SCALE_FACTOR * this._stepSize.common;
    const pathLength = (this._path.length - 1) * stepLength;

    if (movingTime > 0 && movingTime < duration) {
			const progress = movingTime / duration * pathLength;
			const index = Math.floor(progress / stepLength);
			const addition = (progress % stepLength) / stepLength;
			const cell = this._path[index];
			const nextCell = this._path[index + 1];
			this._position.x = cell.position.x + (nextCell.position.x - cell.position.x) * addition + (this._cellSize - this._size) / 2;
			this._position.y = cell.position.y + (nextCell.position.y - cell.position.y) * addition + (this._cellSize - this._size) / 2;
    } else if (movingTime >= duration) {
			this._position.x = this._path[this._path.length - 1].position.x + (this._cellSize - this._size) / 2;
			this._position.y = this._path[this._path.length - 1].position.y + (this._cellSize - this._size) / 2;
      this._startMovingTimestamp = 0;
      this._stage = ActiveBall.STAGES[2];
			this._path[this._path.length - 1].ball = this;
			const sequences = this._field.findSequences([this._path[this._path.length - 1]]);
			this._path = null;
			if (sequences.length) {
				this._field.clearSequences(sequences.flat());
			} else {
				this._field.spawnBalls();
			}
    }
  }

	_updateDestroing(timestamp) {
		if (!this._startDestroyingTimestamp) this._startDestroyingTimestamp = timestamp;

		const destroyingTime = timestamp - this._startDestroyingTimestamp;

		if (destroyingTime > 0 && destroyingTime < ActiveBall.DESTROYING_SPEED) {
			const { x, y } = calcFourPointsBezier(ActiveBall.DESTROY_X, ActiveBall.DESTROY_Y, destroyingTime / ActiveBall.DESTROYING_SPEED);
			this._scale = (x + y) / 2;
		} else if (destroyingTime > ActiveBall.DESTROYING_SPEED) {
			this._scale = 0;
			this._stage = ActiveBall.STAGES[5];
		}
	}

	setSize(size) {
		this._size = size;
	}

	setPosition(position) {
		this._position.x = position.x;
		this._position.y = position.y;
	}

  move(path) {
    this._path = path;
    this._stage = ActiveBall.STAGES[3];
  }

	destroy() {
		this._stage = ActiveBall.STAGES[4];
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

  getStage() {
    return this._stage;
  }
}

ActiveBall.STAGES = {
	1: 'birth',
	2: 'static',
	3: 'moving',
	4: 'destroying',
	5: 'destroyed',
}

ActiveBall.SIZE_SCALE_FACTOR = 12;
ActiveBall.BIRTH_SPEED = 500;
ActiveBall.DESTROYING_SPEED = 500;
ActiveBall.MOVE_SPEED_PER_CELL = 100;
ActiveBall.BIRTH_X = [0, 0.75, 0.5, 1];
ActiveBall.BIRTH_Y = [0, 0, 2.5, 1];
ActiveBall.DESTROY_X = [1, 0.5, 0.75, 0];
ActiveBall.DESTROY_Y = [1, 2.5, 0, 0];