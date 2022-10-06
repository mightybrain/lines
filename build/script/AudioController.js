class AudioController {
  constructor() {
    this._volume = 0.05;
  }

  playAudio(src) {
    const audio = new Audio(src);
    audio.volume = this._volume;
    audio.play();
  }
}