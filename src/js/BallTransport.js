class BallTransport {
  constructor({ ball, path, cellSize, cellsBetweenSize, field, score, stepSize }) {
    this._stepSize = stepSize;
    this._cellSize = cellSize;
    this._cellsBetweenSize = cellsBetweenSize;
    this._field = field;
    this._score = score;
    this._ball = ball;
    this._path = path;

    this._from = this._path[0];
    this._to = this._path[this._path.length - 1];

    this._stepLength = 0;
    this._pathLength = 0;
    this.setSize();

    this._duration = (this._path.length - 1) * BallTransport.MOVE_SPEED_PER_CELL;
    this._startMovingTimestamp = 0;

    this._done = false;
  }

  setSize() {
		this._stepLength = this._cellSize.common + this._cellsBetweenSize.common;
    this._pathLength = (this._path.length - 1) * this._stepLength;
    this._ball.setSize(this._stepSize.common * Ball.SIZE_SCALE_FACTOR);
  }

	update({ timestamp }) {
    if (!this._startMovingTimestamp) this._startMovingTimestamp = timestamp;

    const movingTime = timestamp - this._startMovingTimestamp;

		if (movingTime >= this._duration) this._setFinishPosition();
    else if (movingTime > 0) this._setIntermediatePosition(movingTime);
	}

  _setIntermediatePosition(movingTime) {
    const progress = movingTime / this._duration * this._pathLength;
    const index = Math.floor(progress / this._stepLength);
    const addition = (progress % this._stepLength) / this._stepLength;
    const cell = this._path[index];
    const nextCell = this._path[index + 1];

    const ballSize = this._ball.getSize();
    const ballPosition = {
      x: cell.position.x + (nextCell.position.x - cell.position.x) * addition + (this._cellSize.common - ballSize) / 2,
      y: cell.position.y + (nextCell.position.y - cell.position.y) * addition + (this._cellSize.common - ballSize) / 2,
    }
    this._ball.setPosition(ballPosition);
  }

  _setFinishPosition() {
    const ballSize = this._ball.getSize();
    const ballPosition = {
      x: this._to.position.x + (this._cellSize.common - ballSize) / 2,
      y: this._to.position.y + (this._cellSize.common - ballSize) / 2,
    }
    this._ball.setPosition(ballPosition);
    this._to.ball = this._ball;

    const sequences = this._field.findSequences([this._to]);
    if (sequences.length) {
      this._field.clearSequences(sequences);
      this._score.addNewPoints(sequences.length * Field.SCORE_PER_BALL);
    } else this._field.spawnBalls();

    this._done = true;
  }

  getDone() {
    return this._done;
  }
}

BallTransport.MOVE_SPEED_PER_CELL = 100;


