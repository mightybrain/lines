class ResultScene {
  constructor({ state, canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._state = state;

    this._title = 'GAME OVER';
    this._restartLabel = [
      'CLICK',
      'OR TAP',
      'TO RESTART',
    ]

    this._fontSize = {
      common: 0,
    }
    this.setSize();
  }

  update(time) {

  }

  setSize() {
    this._fontSize.common = this._stepSize.common * MainScene.FONT_SIZE_SCALE_FACTOR;
  }

  render(ctx) {
		ctx.fillStyle = '#4DAF34';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

    const { textHeight } = calcTextMetrics(ctx, this._fontSize.common, this._title);

    const titlePosition = {
      x: 20,
      y: 20 + textHeight,
    }

    ctx.font = `${this._fontSize.common}px LuckiestGuy`;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(this._title, titlePosition.x, titlePosition.y);

    this._restartLabel.forEach((line, index) => {
      const linePosition = {
        x: 20,
        y: 20 + titlePosition.y + 40 + (index + 1) * textHeight + index * 30,
      }
      ctx.fillStyle = '#EFCA30';
      ctx.fillText(line, linePosition.x, linePosition.y);
    })
  }

  handleKeyUp(code) {
    if (code === 'Enter') this._state.setCoreScene();
  }

  handleClick() {
    this._state.setCoreScene();
  }
}

ResultScene.FONT_SIZE_SCALE_FACTOR = 30;