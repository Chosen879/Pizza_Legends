class bgm{ 
  constructor() {
    this.bgm = new Audio("Music/bensound-jazzyfrenchy.mp3")
  }
  start() {
    this.bgm.volume(70)
    this.bgm.start()
  }
  end() {
    this.bgm.end()
  }
}