class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._canvasWidth = 676;
		this._canvasHeight = 752;
		this._fieldSize = 556;
		this._outerOffsetX = 60;
		this._outerOffsetY = 136;
		this._innerOffset = 10;
		this._cellSize = 56;
		this._ballSize = 42;
		this._delimiterSize = 4;
		this._fieldLength = 9;
		this._spawnBallAtTime = 3;
		this._minSequenceLength = 5;
		this._scorePerBall = 1;
		this._setSize();
		this._ctx = canvas.getContext('2d');
		this._model = new GameModel(
			this._fieldLength,
			this._spawnBallAtTime,
			this._minSequenceLength,
			this._scorePerBall
		);
		this._renderer = new GameRenderer(
			this._ctx,
			this._model,
			this._canvasWidth,
			this._canvasHeight,
			this._fieldSize,
			this._outerOffsetX,
			this._outerOffsetY,
			this._innerOffset,
			this._cellSize,
			this._ballSize,
			this._delimiterSize,		
			this._fieldLength,	
		);
		this._addEventHandlers();
		this._startGame();
		this._diff = 0;
		this._prevTimestamp = 0;
		this._fps = 0;
	}

	_startGame() {
		requestAnimationFrame((timestamp) => {
			this._gameLoop(timestamp);
		});
	}
	
	_gameLoop(timestamp) {
		this._diff = timestamp - this._prevTimestamp;
		this._fps = Math.round(1000 / this._diff);
		this._prevTimestamp = timestamp;

		this._model.update(timestamp);
		this._renderer.render();
		requestAnimationFrame((newTimestamp) => {
			this._gameLoop(newTimestamp);
		});
	}

	_addEventHandlers() {
		window.addEventListener('resize', () => {
			this._setSize();
			this._renderer.setSize(
				this._canvasWidth,
				this._canvasHeight,
				this._fieldSize,
				this._outerOffsetX,
				this._outerOffsetY,
				this._innerOffset,
				this._cellSize,
				this._ballSize,
				this._delimiterSize,
			);
		})
 		this._canvas.addEventListener('click', (event) => {
			this._handleClick(event);
		})
	}

	_setSize() {
		this._canvasWidth = document.documentElement.clientWidth;
		this._canvasHeight = document.documentElement.clientHeight;
		this._canvas.width = this._canvasWidth;
		this._canvas.height = this._canvasHeight;

		this._fieldSize = this._canvasWidth * 0.9 > this._canvasHeight * 0.74 ? this._canvasHeight * 0.74 : this._canvasWidth * 0.9;
		this._outerOffsetX = (this._canvasWidth - this._fieldSize) / 2;
		this._outerOffsetY = this._fieldSize * 0.24 > this._canvasHeight * 0.18 ? this._canvasHeight * 0.18 : this._fieldSize * 0.24;
		this._innerOffset = this._fieldSize * 0.018;
		this._delimiterSize = this._fieldSize * 0.007;
		this._cellSize = (this._fieldSize - this._innerOffset * 2 - this._delimiterSize * (this._fieldLength - 1)) / this._fieldLength;
		this._ballSize = this._cellSize * 0.75;
	}

 	_handleClick(event) {
		if (this._model.getAnimations().length) return;
 		const borderTop = this._outerOffsetY + this._innerOffset;
		const borderRight = this._outerOffsetX + this._innerOffset + this._cellSize * this._fieldLength + this._delimiterSize * (this._fieldLength - 1);
		const borderBottom = this._outerOffsetY + this._innerOffset + this._cellSize * this._fieldLength + this._delimiterSize * (this._fieldLength - 1);
		const borderLeft = this._outerOffsetX + this._innerOffset;
		if (event.offsetX < borderLeft || event.offsetX > borderRight || event.offsetY < borderTop || event.offsetY > borderBottom) return;

		const x = Math.floor((event.offsetX - this._outerOffsetX - this._innerOffset) / (this._cellSize + this._delimiterSize));
		const y = Math.floor((event.offsetY - this._outerOffsetY - this._innerOffset) / (this._cellSize + this._delimiterSize));
		this._model.handleClick({ x, y });
	}
}

new Game(document.getElementById('lines'));