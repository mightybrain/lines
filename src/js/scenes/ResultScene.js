class ResultScene {
  constructor({ state, canvasSize, stepSize, safeAreaSize, safeAreaPosition }) {
    this._canvasSize = canvasSize;
    this._safeAreaSize = safeAreaSize;
    this._safeAreaPosition = safeAreaPosition;
    this._stepSize = stepSize;
    this._state = state;
  }

  update(time) {

  }

  setSize() {

  }

  render(ctx) {
		ctx.fillStyle = '#4DAF34';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
  }

  handleKeyUp(code) {
    if (code === 'Enter') this._state.setMainScene();
  }

  handleKeyDown(code) {
    
  }

  handleClick(event) {
    
  }
}