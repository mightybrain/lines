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
	
		const field = model.getField();
		const cellCornerRadius = this._cellSize * 0.36;
		ctx.fillStyle = '#203E60';
		field.forEach((row, rowIndex) => {
			row.forEach((cell, cellIndex) => {
				const x = this._outerOffsetX + this._innerOffset + cellIndex * this._cellSize + cellIndex * this._delimiterSize;
				const y = this._outerOffsetY + this._innerOffset + rowIndex * this._cellSize + rowIndex * this._delimiterSize;
				this._drawRoundedRect(x, y, this._cellSize, this._cellSize, cellCornerRadius);
			})
		})

		const activeBall = model.getActiveBall();
		if (activeBall && !activeBall.path) {
			ctx.fillStyle = '#335070';
			const x = this._outerOffsetX + this._innerOffset + activeBall.position.x * this._cellSize + activeBall.position.x * this._delimiterSize;
			const y = this._outerOffsetY + this._innerOffset + activeBall.position.y * this._cellSize + activeBall.position.y * this._delimiterSize;
			this._drawRoundedRect(x, y, this._cellSize, this._cellSize, cellCornerRadius);
		}
	}

	_drawBalls() {
		const model = this._model;

		const field = model.getField();
		const cellInnerOffset = (this._cellSize - this._ballSize) / 2;
		field.forEach((row, y) => {
			row.forEach((key, x) => {
				if (key === '-') {
					return;
				}
				const position = {
					x: this._outerOffsetX + this._innerOffset + x * this._cellSize + x * this._delimiterSize + cellInnerOffset,
					y: this._outerOffsetY + this._innerOffset + y * this._cellSize + y * this._delimiterSize + cellInnerOffset,
				}
				this._drawBall(model.getColors(key), position);
			})
		})
	
		const activeBall = model.getActiveBall();
		if (activeBall) {
			const position = {
				x: this._outerOffsetX + this._innerOffset + activeBall.position.x * this._cellSize + activeBall.position.x * this._delimiterSize + cellInnerOffset,
				y: this._outerOffsetY + this._innerOffset + activeBall.position.y * this._cellSize + activeBall.position.y * this._delimiterSize + cellInnerOffset,
			}
			this._drawBall(activeBall.colors, position);
		}
	}
	
	_drawPreparedBalls() {
		const ctx = this._ctx;
		let model = this._model;

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
			this._drawBall(colors, { x, y })
		})
	}

	_drawScore() {
		const ctx = this._ctx;
		let model = this._model;

		const score = model.getScore();
		const textSize = this._outerOffsetY * 0.38;
		ctx.font = `${textSize}px LuckiestGuy`;
		let text = ctx.measureText(score);
		ctx.fillStyle = 'white';
		ctx.fillText(score, this._outerOffsetX + this._fieldSize - this._innerOffset - text.width, this._outerOffsetY / 2 + (textSize * 0.4));
	}

	_drawBall(colors, position) {
		const ctx = this._ctx;

		const { x, y } = position;
		const ballGradientOffset = this._ballSize * 0.33;
		const gradient = ctx.createRadialGradient(x + ballGradientOffset, y + ballGradientOffset, 0, x + ballGradientOffset, y + ballGradientOffset, this._ballSize * 0.72)
		gradient.addColorStop(0, colors[0]);
		gradient.addColorStop(.5, colors[1]);
		gradient.addColorStop(1, colors[2]);
		ctx.fillStyle = gradient;
		this._drawRoundedRect(x, y, this._ballSize, this._ballSize, this._ballSize / 2);
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