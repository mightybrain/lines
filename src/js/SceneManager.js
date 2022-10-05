class SceneManager {
  constructor({ canvasSize }) {
		this._canvasSize = canvasSize;

    this._currentScene = null;
    this._futureScene = null;
    this._opacity = 0;
  }

  update(time) {
    const { delta } = time;
    const prevFrameDuration = delta * 1000;

    if (this._currentScene) this._currentScene.update(time);

    if (this._futureScene && (!this._currentScene || this._opacity === 1)) {
      this._currentScene = this._futureScene;
      this._futureScene = null;
    } else if (this._futureScene && this._opacity < 1) {
      this._opacity = Math.min(this._opacity + prevFrameDuration / SceneManager.FADE_DURATION, 1);
    } else if (!this._futureScene && this._opacity > 0) {
      this._opacity = Math.max(this._opacity - prevFrameDuration / SceneManager.FADE_DURATION, 0);
    }
  }

  setSize() {
    if (this._currentScene) this._currentScene.setSize();
    if (this._futureScene) this._futureScene.setSize();
  }

  render(ctx) {
    if (this._currentScene) this._currentScene.render(ctx);

    if (this._opacity) {
      ctx.globalAlpha = this._opacity;
      ctx.fillStyle = '#4DAF34';
      ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
      ctx.globalAlpha = 1;
    };
  }

  setFutureScene(scene) {
    this._futureScene = scene;
  }

  handleClick(event) {
    if (this._futureScene || this._opacity) return;

    if (this._currentScene) this._currentScene.handleClick(event);
  }
}

SceneManager.FADE_DURATION = 500;