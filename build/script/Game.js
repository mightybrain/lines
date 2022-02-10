class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');
		this._canvasWidth = 676;
		this._canvasHeight = 752;
		this._setSize();
		this._model = new GameModel(
			this._ctx,
			this._canvasWidth,
			this._canvasHeight,
		);
		this._renderer = new GameRenderer(
			this._ctx,
			this._model,
			this._canvasWidth,
			this._canvasHeight,
		);
		this._addEventHandlers();
		this._startGame();
	}

	_startGame() {
		requestAnimationFrame((timestamp) => {
			this._gameLoop(timestamp);
		});
	}
	
	_gameLoop(timestamp) {
		this._model.update(timestamp);
		this._renderer.render();
		requestAnimationFrame((newTimestamp) => {
			this._gameLoop(newTimestamp);
		});
	}

	_addEventHandlers() {
		window.addEventListener('resize', () => {
			this._setSize();
			this._model.setSize(
				this._canvasWidth,
				this._canvasHeight,
			);
			this._renderer.setSize(
				this._canvasWidth,
				this._canvasHeight,
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
	}

 	_handleClick(event) {
		this._model.handleClick(event);
	}
}

new Game(document.getElementById('lines'));