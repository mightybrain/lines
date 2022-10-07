class Renderer {
	constructor({ ctx, canvasSize, sceneManager }) {
		this._ctx = ctx;
		this._canvasSize = canvasSize;
		this._sceneManager = sceneManager;
	}

	render() {
		this._clearCanvas();
		this._drawBackground();
		this._drawScene();
	}

	_clearCanvas() {
		this._ctx.clearRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_drawBackground() {
		this._ctx.fillStyle = '#4DAF34';
		this._ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_drawScene() {
		this._sceneManager.render(this._ctx);
	}
}