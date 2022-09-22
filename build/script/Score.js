class Score {
  constructor({ canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;

		this._areaSize = {
			width: 0,
			heigh: 0,
		};
		this._fontSize = {
			common: 0,
		};
		this._spriteSize = {
			common: 0,
		}
		this._areaCornerRadius = 0;
		this.setSize();

		this._currentScore = 0;
		this._newScore = 0
		this._lastUpdateTimestamp = 0;
		this._scoreSpeed = 100;

    this._loaded = false;
    this._sprite = new Image();
    this._sprite.src = 'images/coin.png';
    
    this._sprite.addEventListener('load', () => {
      this._loaded = true;
    })
  }

  update(time) {
		const { timestamp } = time;

		if (this._newScore && timestamp - this._lastUpdateTimestamp > this._scoreSpeed) {
			this._currentScore++;
			this._newScore--;
			this._lastUpdateTimestamp = timestamp;
		}
  }

	setSize() {
		this._areaSize.height = this._stepSize.common * Score.AREA_HEIGHT_SCALE_FACTOR;
		this._fontSize.common = this._stepSize.common * Score.FONT_SIZE_SCALE_FACTOR;
		this._spriteSize.common = this._stepSize.common * Score.SPRITE_SIZE_SCALE_FACTOR;
		this._areaCornerRadius = this._stepSize.common * Score.AREA_CORNER_SCALE_FACTOR;
	}

  render(ctx) {
    if (!this._loaded) return;

		const { textWidth, textHeight } = calcTextMetrics(ctx, this._fontSize.common, this._currentScore);
		const areaWidth = textWidth + this._spriteSize.common + this._stepSize.common * 9;

		const areaPosition = {
			x: this._canvasSize.width - areaWidth - this._stepSize.common * 3,
			y: this._stepSize.common * 3,
		}

		const textPosition = {
			x: areaPosition.x + this._stepSize.common * 3,
			y: areaPosition.y + this._areaSize.height / 2 + textHeight / 2,
		}

		const spritePosition = {
			x: areaPosition.x + areaWidth - this._spriteSize.common - this._stepSize.common * 3,
			y: areaPosition.y + this._areaSize.height / 2 - this._spriteSize.common / 2,
		}

    ctx.fillStyle = '#5DBB46';
    renderRoundedRect(ctx, areaPosition.x, areaPosition.y, areaWidth, this._areaSize.height, this._areaCornerRadius);

    ctx.font = `${this._fontSize.common}px LuckiestGuy`;
    ctx.fillStyle = 'white';
    ctx.fillText(this._currentScore, textPosition.x, textPosition.y);
    ctx.drawImage(this._sprite, spritePosition.x, spritePosition.y, this._spriteSize.common, this._spriteSize.common);
  }
}

Score.SPRITE_SIZE_SCALE_FACTOR = 10;
Score.FONT_SIZE_SCALE_FACTOR = 10;
Score.AREA_HEIGHT_SCALE_FACTOR = 16;
Score.AREA_CORNER_SCALE_FACTOR = 6;