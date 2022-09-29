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
		this._safeAreaSize = {
			width: 0,
			heifht: 0,
		};
		this._safeAreaPosition = {
			x: 0,
			y: 0,
		};
		this._setSize();

		this._sceneManager = new SceneManager({
			canvasSize: this._canvasSize,
		});

		this._state = new State({
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
			safeAreaSize: this._safeAreaSize,
			safeAreaPosition: this._safeAreaPosition,
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
			this._sceneManager.update({ delta, timestamp, prevTimestamp: this._prevTimestamp });
			this._renderer.render();
		}
		
		this._prevTimestamp = timestamp;
	}

	_addEventHandlers() {
		window.addEventListener('resize', () => {
			this._setSize();
			this._sceneManager.setSize();
		})
 		window.addEventListener('keyup', event => {
			this._sceneManager.handleKeyUp(event);
		})
		window.addEventListener('keydown', event => {
			if (!event.repeat) this._sceneManager.handleKeyDown(event);
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

		//this._stepSize.common = this._canvasSize.width / Game.MAX_STEPS.x;
		//if (this._stepSize.common * Game.MAX_STEPS.y > this._canvasSize.height) this._stepSize.common = this._canvasSize.height / Game.MAX_STEPS.y;
		this._stepSize.common = this._canvasSize.height / Game.MAX_STEPS.y;
		if (this._canvasSize.height > this._canvasSize.width) this._stepSize.common = this._canvasSize.width / Game.MAX_STEPS.x;

		this._safeAreaSize.width = this._stepSize.common * Game.MAX_STEPS.x;
		this._safeAreaSize.height = this._stepSize.common * Game.MAX_STEPS.y;

		this._safeAreaPosition.x = (this._canvasSize.width - this._safeAreaSize.width) / 2;
		this._safeAreaPosition.y = (this._canvasSize.height - this._safeAreaSize.height) / 2;
	}
}

Game.MAX_STEPS = {
	//x: 372,
	//x: 182,
	//y: 182,
	x: 160,
	y: 160,
}

new Game(document.getElementById('lines'));