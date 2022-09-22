class CoreScene {
  constructor({ state, canvasSize, stepSize, safeAreaSize, safeAreaPosition }) {
    this._canvasSize = canvasSize;
    this._safeAreaSize = safeAreaSize;
    this._safeAreaPosition = safeAreaPosition;
    this._stepSize = stepSize;
    this._state = state;

    this._scorePerBall = 1;
    this._minSequenceLength = 5;

    this._score = new Score({
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
    });

    this._queue = new Queue({
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
    })

		this._field = new Field({
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
    });

    this._queue.prepareBalls();
  }

  setSize() {
    this._score.setSize();
    this._queue.setSize();
    this._field.setSize();
  }

  update(time) {
    this._score.update(time);
  }

  render(ctx) {
		ctx.fillStyle = '#4DAF34';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
    
    this._field.render(ctx);
    this._queue.render(ctx);
    this._score.render(ctx);
  }

  handleKeyUp(code) {

  }

  handleKeyDown(code) {
    
  }
}