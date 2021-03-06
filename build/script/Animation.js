class Animation {
  constructor(type, elem, path, duration, delay, setUpdate, onEnd) {
    this._type = type;
    this._elem = elem;
    this._path = path;
    this._duration = duration;
    this._delay = delay || 0;
    this._setUpdate = setUpdate;
    this.onEnd = onEnd || null;

    this._startTime = 0;
    this._running = false;
    this._ended = false;
  }

  getElem() {
    return this._elem;
  }

  getRunning() {
    return this._running;
  }

  getEnded() {
    return this._ended;
  }

  getType() {
    return this._type;
  }

  start(timestamp) {
    this._startTime = timestamp;
    this._running = true;
  }

  update(timestamp) {
    let timeProgress = this._getTimeProgress(timestamp);
    timeProgress = timeProgress > 100 ? 100 : timeProgress;
    const pathProgress = this._getPathProgress(timeProgress);
    const { currentStep, nextStep, currentStepProgress } = pathProgress;

    this._setUpdate(this._elem, currentStep, nextStep, currentStepProgress);

    this._ended = timeProgress === 100;
  }

  _getPathProgress(timeProgress) {
    const pathProgress =  timeProgress / 100 * (this._path.length - 1);
    const currentStep = this._path[Math.floor(pathProgress)];
    const nextStep =  Math.floor(pathProgress) === this._path.length - 1 ? currentStep : this._path[Math.floor(pathProgress) + 1];
    const currentStepProgress = pathProgress - Math.floor(pathProgress);
    return {
      currentStep,
      nextStep,
      currentStepProgress
    }
  }

  _getTimeProgress(timestamp) {
    const progress = (timestamp - this._startTime - this._delay) / this._duration * 100;
    return progress < 0 ? 0 : progress;
  }
}

Animation.TYPES = [
  'move ball',
  'scale in ball',
  'scale out ball'
]