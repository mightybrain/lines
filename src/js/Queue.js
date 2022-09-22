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
	}

  render(ctx) {
    ctx.fillStyle = '#5DBB46';
    renderRoundedRect(ctx, this._areaPosition.x, this._areaPosition.y, this._areaSize.width, this._areaSize.height, this._areaCornerRadius);

		//this._queue.forEach(ball => ball.render(ctx));
  }

	prepareBalls() {
		for(let i = 0; i < this._spawnBallsAtTime; i++) {
			this._queue.push(new Ball({
				color: Ball.COLORS[this._getRandomBallKey()],
				position: {
					x: 0 + this._queue.length * this._stepSize.common * Ball.SIZE_SCALE_FACTOR,
					y: 0,
				},
				size: this._stepSize.common * Ball.SIZE_SCALE_FACTOR,
			}));
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