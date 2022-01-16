class GameRenderer {
	constructor(ctx, model, rendererWidth, rendererHeight, fieldSize, outerOffsetX, outerOffsetY, innerOffset, cellSize, ballSize, delimiterSize, fieldLength) {
		this._ctx = ctx;
		this._model = model;
		this._rendererWidth = rendererWidth;
		this._rendererHeight = rendererHeight;
		this._fieldSize = fieldSize;
		this._outerOffsetX = outerOffsetX;
		this._outerOffsetY = outerOffsetY;
		this._innerOffset = innerOffset;
		this._cellSize = cellSize;
		this._ballSize = ballSize;
		this._delimiterSize = delimiterSize;
		this._fieldLength = fieldLength;
	}

	setSize(rendererWidth, rendererHeight, fieldSize, outerOffsetX, outerOffsetY, innerOffset, cellSize, ballSize, delimiterSize) {
		this._rendererWidth = rendererWidth;
		this._rendererHeight = rendererHeight;
		this._fieldSize = fieldSize;
		this._outerOffsetX = outerOffsetX;
		this._outerOffsetY = outerOffsetY;
		this._innerOffset = innerOffset;
		this._cellSize = cellSize;
		this._ballSize = ballSize;
		this._delimiterSize = delimiterSize;
	}

	render() {
		this._clearCanvas();
		this._drawField();
 		this._drawBalls();
		this._drawPreparedBalls();
		this._drawScore();
		this._drawAnimations();
	}

	_clearCanvas() {
		this._ctx.clearRect(0, 0, this._rendererWidth, this._rendererHeight);
	}

	_drawField() {
		const ctx = this._ctx;
		const model = this._model;

		ctx.fillStyle = '#4DAF34';
		ctx.fillRect(0, 0, this._rendererWidth, this._rendererHeight);

		ctx.fillStyle = '#1D3753';
		const fieldCornerRadius = this._fieldSize * 0.045;
		this._drawRoundedRect(this._outerOffsetX, this._outerOffsetY, this._fieldSize, this._fieldSize, fieldCornerRadius);
	
		ctx.fillStyle = '#203E60';
		const cellCornerRadius = this._cellSize * 0.36;
		for (let i = 0; i < this._fieldLength; i++) {
			for (let j = 0; j < this._fieldLength; j++) {
				const x = this._outerOffsetX + this._innerOffset + j * this._cellSize + j * this._delimiterSize;
				const y = this._outerOffsetY + this._innerOffset + i * this._cellSize + i * this._delimiterSize;
				this._drawRoundedRect(x, y, this._cellSize, this._cellSize, cellCornerRadius);
			}
		}

		const selectedBall = model.getSelectedBall();
		if (selectedBall) {
			ctx.fillStyle = '#335070';
			const x = this._outerOffsetX + this._innerOffset + selectedBall.position.x * this._cellSize + selectedBall.position.x * this._delimiterSize;
			const y = this._outerOffsetY + this._innerOffset + selectedBall.position.y * this._cellSize + selectedBall.position.y * this._delimiterSize;
			this._drawRoundedRect(x, y, this._cellSize, this._cellSize, cellCornerRadius);
		}
	}

	_drawBalls() {
		const model = this._model;

		const field = model.getField();
		const cellInnerOffset = (this._cellSize - this._ballSize) / 2;
		field.forEach((row, y) => {
			row.forEach((key, x) => {
				if (key === '-') return;
				const colors = model.getColors(key);
				const position = {
					x: this._outerOffsetX + this._innerOffset + x * this._cellSize + x * this._delimiterSize + cellInnerOffset,
					y: this._outerOffsetY + this._innerOffset + y * this._cellSize + y * this._delimiterSize + cellInnerOffset,
				};
				this._drawBall(colors, position, this._ballSize);
			})
		})
	}
	
	_drawPreparedBalls() {
		const ctx = this._ctx;
		const model = this._model;

		const nextPreparedColors = model.getNextPreparedColors();
		nextPreparedColors.forEach((key, index) => {
			let x = this._outerOffsetX + this._innerOffset + index * this._cellSize + index * this._delimiterSize;
			let y = this._outerOffsetY / 2 - (this._cellSize / 2);
	
			ctx.fillStyle = '#5DBB46';
			const cellCornerRadius = this._cellSize * 0.36;
			this._drawRoundedRect(x, y, this._cellSize, this._cellSize, cellCornerRadius);
	
			const cellInnerOffset = (this._cellSize - this._ballSize) / 2;
			x += cellInnerOffset;
			y += cellInnerOffset;
	
			const colors = model.getColors(key);
			this._drawBall(colors, { x, y }, this._ballSize);
		})
	}

	_drawScore() {
		const ctx = this._ctx;
		const model = this._model;

		const score = model.getScore();
		const textSize = this._outerOffsetY * 0.38;
		ctx.font = `${textSize}px LuckiestGuy`;
		const text = ctx.measureText(score);
		ctx.fillStyle = 'white';
		ctx.fillText(score, this._outerOffsetX + this._fieldSize - this._innerOffset - text.width, this._outerOffsetY / 2 + (textSize * 0.4));
	}

	_drawAnimations() {
		const animations = this._model.getAnimations();

		animations.forEach((animation) => {
			const elem = animation.getElem();
			const ballSize = this._ballSize * elem.scaleFactor;
			const cellInnerOffset = (this._cellSize - ballSize) / 2;
			const position = {
				x: this._outerOffsetX + this._innerOffset + elem.position.x * this._cellSize + elem.position.x * this._delimiterSize + cellInnerOffset,
				y: this._outerOffsetY + this._innerOffset + elem.position.y * this._cellSize + elem.position.y * this._delimiterSize + cellInnerOffset,
			}
			this._drawBall(elem.colors, position, ballSize);
		})
	}

	_drawBall(colors, position, ballSize) {
		const ctx = this._ctx;

		const { x, y } = position;

		const ballGradientOffset = ballSize * 0.33;
		const gradient = ctx.createRadialGradient(x + ballGradientOffset, y + ballGradientOffset, 0, x + ballGradientOffset, y + ballGradientOffset, ballSize * 0.72);
		gradient.addColorStop(0, colors[0]);
		gradient.addColorStop(.5, colors[1]);
		gradient.addColorStop(1, colors[2]);
		ctx.fillStyle = gradient;
		this._drawRoundedRect(x, y, ballSize, ballSize, ballSize / 2);
	}

	_drawRoundedRect(x, y, width, height, radius) {
		const ctx = this._ctx;

		ctx.beginPath();
		ctx.moveTo(x, y + radius);
		ctx.arcTo(x, y + height, x + radius, y + height, radius);
		ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
		ctx.arcTo(x + width, y, x + width - radius, y, radius);
		ctx.arcTo(x, y, x, y + radius, radius);
		ctx.fill();
	}
}