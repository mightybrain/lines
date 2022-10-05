class Score {
  constructor({ canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;

		this._areaSize = {
			width: 0,
			heigh: 0,
		};
		this._fontSize = 0;
		this._spriteSize = 0;
		this._areaCornerRadius = 0;
		this.setSize();

		this._currentScore = 0;
		this._newScore = 0
		this._lastUpdateTimestamp = 0;

    this._loaded = false;
    this._sprite = new Image();
    this._sprite.src = 'images/coin.png';
    
    this._sprite.addEventListener('load', () => {
      this._loaded = true;
    })
  }

	addNewPoints(points) {
		this._newScore += points;
	}
	
	getCurrentScore() {
		return this._currentScore;
	}

  update(time) {
		const { timestamp } = time;

		if (this._newScore && timestamp - this._lastUpdateTimestamp >= Score.UPDATE_SPEED) {
			this._currentScore++;
			this._newScore--;
			this._lastUpdateTimestamp = timestamp;
		}
  }

	setSize() {
		this._areaSize.height = this._stepSize.common * Score.AREA_HEIGHT_SCALE_FACTOR;
		this._fontSize = this._stepSize.common * Score.FONT_SIZE_SCALE_FACTOR;
		this._spriteSize = this._stepSize.common * Score.SPRITE_SIZE_SCALE_FACTOR;
		this._areaCornerRadius = this._stepSize.common * Score.AREA_CORNER_SCALE_FACTOR;
	}

  render(ctx) {
    if (!this._loaded) return;

    ctx.font = `${this._fontSize}px LuckiestGuy`;

		const { textWidth, textHeight } = calcTextMetrics(ctx, this._currentScore);
		const areaWidth = textWidth + this._spriteSize + this._stepSize.common * 9;

		const areaPosition = {
			x: this._canvasSize.width - areaWidth - 20,
			y: 20,
		}

		const textPosition = {
			x: areaPosition.x + this._stepSize.common * 3,
			y: areaPosition.y + this._areaSize.height / 2 + textHeight / 2,
		}

		const spritePosition = {
			x: areaPosition.x + areaWidth - this._spriteSize - this._stepSize.common * 3,
			y: areaPosition.y + this._areaSize.height / 2 - this._spriteSize / 2,
		}

    ctx.fillStyle = '#5DBB46';
    renderRoundedRect(ctx, areaPosition.x, areaPosition.y, areaWidth, this._areaSize.height, this._areaCornerRadius);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(this._currentScore, textPosition.x, textPosition.y);

    ctx.drawImage(this._sprite, spritePosition.x, spritePosition.y, this._spriteSize, this._spriteSize);
  }
}

Score.SPRITE_SIZE_SCALE_FACTOR = 10;
Score.FONT_SIZE_SCALE_FACTOR = 10;
Score.AREA_HEIGHT_SCALE_FACTOR = 16;
Score.AREA_CORNER_SCALE_FACTOR = 6;
Score.UPDATE_SPEED = 50;