class State {
  constructor({ sceneManager, canvasSize, stepSize }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._sceneManager = sceneManager;

    this._totalScore = 0;
  }

  setTotalScore(score) {
    this._totalScore = score;
  }

  getTotalScore() {
    
  }

  setMainScene() {
    this._sceneManager.setFutureScene(new MainScene({
      state: this,
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
    }))
  }

  setCoreScene() {
    this._sceneManager.setFutureScene(new CoreScene({
      state: this,
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
    }))
  }

  setResultScene() {
    this._sceneManager.setFutureScene(new ResultScene({
      state: this,
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
    }))
  }

}