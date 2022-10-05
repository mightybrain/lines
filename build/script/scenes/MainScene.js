class MainScene {
  constructor({ state, canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._state = state;

    this._title = 'LINES';
    this._hint = [
      'CLICK',
      'OR TAP',
      'TO START',
    ]

    this._fontSize = 0;
    this._spaceBetweenLines = 0;
    this._spaceBetweenParagraphs = 0;
    this.setSize();
  }

  update(time) {

  }

  setSize() {
    this._fontSize = this._stepSize.common * MainScene.FONT_SIZE_SCALE_FACTOR;
    this._spaceBetweenLines = this._stepSize.common * MainScene.SPACE_BETWEEN_LINES_SCALE_FACTOR;
    this._spaceBetweenParagraphs = this._stepSize.common * MainScene.SPACE_BETWEEN_PARAGRAPHS_SCALE_FACTOR;
  }

  render(ctx) {
		ctx.fillStyle = '#4DAF34';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

    ctx.font = `${this._fontSize}px LuckiestGuy`;

    const { textHeight } = calcTextMetrics(ctx, this._title);

    const titlePosition = {
      x: 20,
      y: 20 + textHeight,
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(this._title, titlePosition.x, titlePosition.y);

    this._hint.forEach((line, index) => {
      const linePosition = {
        x: 20,
        y: titlePosition.y + this._spaceBetweenParagraphs + (index + 1) * textHeight + index * this._spaceBetweenLines,
      }
      
      ctx.fillStyle = '#EFCA30';
      ctx.fillText(line, linePosition.x, linePosition.y);
    })
  }

  handleClick() {
    this._state.setCoreScene();
  }

}

MainScene.FONT_SIZE_SCALE_FACTOR = 30;
MainScene.SPACE_BETWEEN_LINES_SCALE_FACTOR = 6;
MainScene.SPACE_BETWEEN_PARAGRAPHS_SCALE_FACTOR = 8;