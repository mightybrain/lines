class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');

		this._canvasSize = {
			width: 0,
			height: 0,
		};
		this._stepSize = {
			common: 0,
		};
		this._setSize();

		this._sceneManager = new SceneManager({
			canvasSize: this._canvasSize,
		});

		this._state = new State({
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
			sceneManager: this._sceneManager,
		});

		this._renderer = new Renderer({
			ctx: this._ctx,
			canvasSize: this._canvasSize,
			sceneManager: this._sceneManager,
		});

		this._prevTimestamp = 0;

		this._addEventHandlers();
		this._startGame();
	}

	_startGame() {
		this._state.setMainScene();

		requestAnimationFrame(timestamp => {
			this._gameLoop(timestamp);
		});
	}
	
	_gameLoop(timestamp) {
		requestAnimationFrame(newTimestamp => {
			this._gameLoop(newTimestamp);
		});

		if (this._prevTimestamp) {
			const delta = (timestamp - this._prevTimestamp) / 1000;
			this._sceneManager.update({ delta, timestamp });
			this._renderer.render();
		}
		
		this._prevTimestamp = timestamp;
	}

	_addEventHandlers() {
		window.addEventListener('resize', () => {
			this._setSize();
			this._sceneManager.setSize();
		})
		window.addEventListener('click', event => {
			this._sceneManager.handleClick(event);
		})
	}

	_setSize() {
		this._canvasSize.width = document.documentElement.clientWidth;
		this._canvasSize.height = document.documentElement.clientHeight;
		this._canvas.width = this._canvasSize.width;
		this._canvas.height = this._canvasSize.height;

		if (this._canvasSize.width >= this._canvasSize.height) this._stepSize.common = (this._canvasSize.height - 100) / Game.MAX_STEPS.y;
		else this._stepSize.common = (this._canvasSize.width - 40) / Game.MAX_STEPS.x;
	}
}

Game.MAX_STEPS = {
	x: 160,
	y: 160,
}

addEventListener('DOMContentLoaded', () => {
	new Game(document.getElementById('lines'));
})
