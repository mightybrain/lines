class Queue {
  constructor({ canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;

    this._spawnBallsAtTime = 3;
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

	setSize() {
		this._areaPosition.x = this._stepSize.common * 3;
		this._areaPosition.y = this._stepSize.common * 3;
		this._areaSize.width = this._stepSize.common * 8 + this._spawnBallsAtTime * this._stepSize.common * Ball.SIZE_SCALE_FACTOR;
		this._areaSize.height = this._stepSize.common * Queue.AREA_HEIGHT_SCALE_FACTOR;
		this._areaCornerRadius = this._stepSize.common * Queue.AREA_CORNER_SCALE_FACTOR;
		this._queue.forEach(ball => ball.setSize());
	}

  render(ctx) {
    ctx.fillStyle = '#5DBB46';
    renderRoundedRect(ctx, this._areaPosition.x, this._areaPosition.y, this._areaSize.width, this._areaSize.height, this._areaCornerRadius);

		this._queue.forEach(ball => ball.render(ctx));
  }

	prepareBalls() {
		for(let i = 0; i < this._spawnBallsAtTime; i++) {
			const color = this._getRandomBallColor();
			const size = this._stepSize.common * Ball.SIZE_SCALE_FACTOR;
			const position = {
				x: this._areaPosition.x + this._stepSize.common * 2 * (this._queue.length + 1)  + this._queue.length * size,
				y: this._areaPosition.y + this._areaSize.height / 2 - size / 2,
			};
			const ball = new Ball({ color, size, position, stepSize: this._stepSize });
			this._queue.push(ball);
		}
	}

	_getRandomBallColor() {
    const keys = Object.keys(Ball.COLORS);
    const index = getRandomFromRange(0, keys.length);
		const key = keys[index];
		return Ball.COLORS[key];
	}
}

Queue.AREA_HEIGHT_SCALE_FACTOR = 16;
Queue.AREA_CORNER_SCALE_FACTOR = 6;