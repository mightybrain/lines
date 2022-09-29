class Queue {
  constructor({ canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;

    this._queue = [];

		this._areaPosition = {
			x: 0,
			y: 0,
		}
		this._areaSize = {
			width: 0,
			height: 0,
		}
		this._areaCornerRadius = 0;
		this.setSize();
  }

	update(time) {

	}

	setSize() {
		this._areaPosition.x = this._stepSize.common * 3;
		this._areaPosition.y = this._stepSize.common * 3;
		this._areaSize.width = this._stepSize.common * 8 + Queue.SPAWN_BALLS_AT_TIME * this._stepSize.common * Ball.SIZE_SCALE_FACTOR;
		this._areaSize.height = this._stepSize.common * Queue.AREA_HEIGHT_SCALE_FACTOR;
		this._areaCornerRadius = this._stepSize.common * Queue.AREA_CORNER_SCALE_FACTOR;
		this._queue.forEach((ball, index) => {
			const ballSize = this._stepSize.common * Ball.SIZE_SCALE_FACTOR;
			const ballPosition = {
				x: this._areaPosition.x + this._stepSize.common * 2 * (index + 1) + index * ballSize,
				y: this._areaPosition.y + this._areaSize.height / 2 - ballSize / 2,
			};
			ball.setSize(ballSize);
			ball.setPosition(ballPosition);
		});
	}

  render(ctx) {
    ctx.fillStyle = '#5DBB46';
    renderRoundedRect(ctx, this._areaPosition.x, this._areaPosition.y, this._areaSize.width, this._areaSize.height, this._areaCornerRadius);

		this._queue.forEach(ball => ball.render(ctx));
  }

	getQueue() {
		return this._queue.slice();
	}

	clearQueue() {
		this._queue = [];
	}

	prepareBalls() {
		for(let i = 0; i < Queue.SPAWN_BALLS_AT_TIME; i++) {
			const key = this._getRandomBallKey();
			const color = Ball.COLORS[key];
			const size = this._stepSize.common * Ball.SIZE_SCALE_FACTOR;
			const position = {
				x: this._areaPosition.x + this._stepSize.common * 2 * (this._queue.length + 1) + this._queue.length * size,
				y: this._areaPosition.y + this._areaSize.height / 2 - size / 2,
			};
			const ball = new Ball({ key, color, size, position });
			this._queue.push(ball);
		}
	}

	_getRandomBallKey() {
    const keys = Object.keys(Ball.COLORS);
    const index = getRandomFromRange(0, keys.length);
		return keys[index];
	}
}

Queue.AREA_HEIGHT_SCALE_FACTOR = 16;
Queue.AREA_CORNER_SCALE_FACTOR = 6;
Queue.SPAWN_BALLS_AT_TIME = 3;