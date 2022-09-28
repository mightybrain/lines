class State {
  constructor({ sceneManager, canvasSize, stepSize, safeAreaSize, safeAreaPosition }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._safeAreaSize = safeAreaSize;
    this._safeAreaPosition = safeAreaPosition;
    this._sceneManager = sceneManager;

    this._totalScore = 0;
  }

  setTotalScore(score) {
    this._totalScore = score;
  }

  getTotalScore() {
    
  }

  setInitialScene() {
    this._sceneManager.setFutureScene(new MainScene({
      state: this,
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
      safeAreaSize: this._safeAreaSize,
      safeAreaPosition: this._safeAreaPosition,
    }))
  }

  setCoreScene() {
    this._sceneManager.setFutureScene(new CoreScene({
      state: this,
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
      safeAreaSize: this._safeAreaSize,
      safeAreaPosition: this._safeAreaPosition,
    }))
  }

  setResultScene() {
    this._sceneManager.setFutureScene(new ResultScene({
      state: this,
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
      safeAreaSize: this._safeAreaSize,
      safeAreaPosition: this._safeAreaPosition,
    }))
  }

}