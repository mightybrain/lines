class GameRenderer {
	constructor(ctx, model, rendererWidth, rendererHeight) {
		this._ctx = ctx;
		this._model = model;
		this._rendererWidth = rendererWidth;
		this._rendererHeight = rendererHeight;
		this._colors = Object.keys(GameRenderer.COLORS);
	}

	setSize(rendererWidth, rendererHeight) {
		this._rendererWidth = rendererWidth;
		this._rendererHeight = rendererHeight;
	}

	render() {
		this._clearCanvas();
		this._drawBackground();
		this._drawField();
 		this._drawBalls();

		this._drawScore();
		this._drawPreparedBalls();

		this._drawAnimations();
	}

	_clearCanvas() {
		this._ctx.clearRect(0, 0, this._rendererWidth, this._rendererHeight);
	}

	_drawBackground() {
		const ctx = this._ctx;

		ctx.fillStyle = '#4DAF34';
		ctx.fillRect(0, 0, this._rendererWidth, this._rendererHeight);
	}

	_drawField() {
		const ctx = this._ctx;
		const model = this._model;
		const field = model.getField();
		const selectedBall = model.getSelectedBall();

		ctx.fillStyle = '#1D3753';
		const fieldCornerRadius = field.size * 0.045;
		this._drawRoundedRect(field.position.x, field.position.y, field.size, field.size, fieldCornerRadius);

		const cellCornerRadius = field.cellSize * 0.32;
		ctx.fillStyle = '#203E60';
		field.map.forEach((row) => {
			row.forEach((cell) => {
				this._drawRoundedRect(cell.position.x, cell.position.y, field.cellSize, field.cellSize, cellCornerRadius);
			})
		})

		if (selectedBall) {
			const { coords } = selectedBall;
			const cell = field.map[coords.y][coords.x];
			ctx.fillStyle = '#335070';
			this._drawRoundedRect(cell.position.x, cell.position.y, field.cellSize, field.cellSize, cellCornerRadius);
		}
	}

	_drawBalls() {
		const model = this._model;
		const field = model.getField();

		field.map.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (!cell.ball) return;
				const { colors, position, size, scaleFactor } = cell.ball;
				this._drawBall(colors, position, size * scaleFactor);
			})
		})

		const selectedBall = this._model.getSelectedBall();
		if (selectedBall) {
			const { colors, position, size, scaleFactor } = selectedBall;
			this._drawBall(colors, position, size * scaleFactor);
		}
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

	_drawAnimations() {
		this._drawBallsAnimations();
	}

	_drawBallsAnimations() {
		const animations = this._model.getBallsAnimations();

		animations.forEach((animation) => {
			const elem = animation.getElem();
			const { size, scaleFactor, colors, position } = elem;
			this._drawBall(colors, position, size * scaleFactor);
		})
	}

	_drawScore() {
		const ctx = this._ctx;
		const model = this._model;
		const score = model.getScore();

		const { areaWidth, areaHeight, areaPosition } = score;
		ctx.fillStyle = '#5DBB46';
		const areaCornerRadius = areaHeight * 0.32;
		this._drawRoundedRect(areaPosition.x, areaPosition.y, areaWidth, areaHeight, areaCornerRadius);

		const { value, valueSize, valuePosition } = score;
		ctx.font = `${valueSize}px LuckiestGuy`;
		ctx.fillStyle = 'white';
		ctx.fillText(value, valuePosition.x, valuePosition.y);

		const { icon, iconSize, iconPosition } = score;
		ctx.drawImage(icon, iconPosition.x, iconPosition.y, iconSize, iconSize);
	}

	_drawPreparedBalls() {
		const ctx = this._ctx;
		const model = this._model;
		const preparedBalls = model.getPreparedBalls();

		const { areaWidth, areaHeight, areaPosition } = preparedBalls;
		ctx.fillStyle = '#5DBB46';
		const areaCornerRadius = areaHeight * 0.32;
		this._drawRoundedRect(areaPosition.x, areaPosition.y, areaWidth, areaHeight, areaCornerRadius);

		preparedBalls.balls.forEach((ball) => {
			const { colors, position, size } = ball;
			this._drawBall(colors, position, size);
		})
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

GameRenderer.COLORS = {
	green: '#4DAF34'
}