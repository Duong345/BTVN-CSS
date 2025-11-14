class MediaPlayer {
  constructor(container, videoSrc) {
    this.container = container;
    this.videoSrc = videoSrc;
    this.isPlaying = false;
    this.hideControlsTimeout = null;
    this.previousVolume = 1;
    this.render();
    this.setupEvents();
  }

  render() {
    this.container.classList.add("media-player");
    this.container.innerHTML = `

      <div class="video-wrapper">
        <video class="video" src="${this.videoSrc}"></video>

        <div class="controls">
          <button class="btn play-pause" data-tooltip="Play">
            <span class="icon">▶</span>
          </button>
          <button class="btn backward" data-tooltip="Seek backward">↺<small>10</small></button>
          <button class="btn forward" data-tooltip="Seek forward">↻<small>10</small></button>
          <input type="range" class="seek-bar" value="0" step="0.1">
          <span class="time-display">0:00 / 0:00</span>
          <button class="btn mute" data-tooltip="Mute">🔊</button>
          <input type="range" class="volume-bar" min="0" max="1" step="0.05" value="1">
        </div>
      </div>
    `;
    this.video = this.container.querySelector(".video");
    this.playPauseBtn = this.container.querySelector(".play-pause");
    this.backwardBtn = this.container.querySelector(".backward");
    this.forwardBtn = this.container.querySelector(".forward");
    this.seekBar = this.container.querySelector(".seek-bar");
    this.muteBtn = this.container.querySelector(".mute");
    this.volumeBar = this.container.querySelector(".volume-bar");
    this.timeDisplay = this.container.querySelector(".time-display");
    this.controls = this.container.querySelector(".controls");
    this.statusToggle = null;
  }

  locateStatusToggle() {
    const parentToggle = window.parent.document.querySelector(".status-toggle");
    this.statusToggle = parentToggle;
  }

  setupEvents() {
    this.locateStatusToggle();
    this.playPauseBtn.addEventListener("click", () => {
      if (this.video.paused) {
        this.video.play();
      } else {
        this.video.pause();
      }
    });

    this.video.addEventListener("play", () => {
      this.isPlaying = true;
      this.playPauseBtn.querySelector(".icon").textContent = "❚❚";
      this.playPauseBtn.setAttribute("data-tooltip", "Pause");
      this.hideControlsAfterDelay();
      if (this.statusToggle) {
        this.statusToggle.textContent = "Video is playing";
        this.statusToggle.classList.add("active");
      }
    });

    this.video.addEventListener("pause", () => {
      this.isPlaying = false;
      this.playPauseBtn.querySelector(".icon").textContent = "▶";
      this.playPauseBtn.setAttribute("data-tooltip", "Play");
      this.controls.classList.remove("hidden");
      clearTimeout(this.hideControlsTimeout);
      if (this.statusToggle) {
        this.statusToggle.textContent = "Video is paused";
        this.statusToggle.classList.remove("active");
      }
    });

    this.video.addEventListener("timeupdate", () => {
      this.seekBar.value = this.video.currentTime;
      this.updateTimeDisplay();
    });

    this.video.addEventListener("loadedmetadata", () => {
      this.seekBar.max = this.video.duration;
      this.updateTimeDisplay();
    });

    this.seekBar.addEventListener("input", () => {
      this.video.currentTime = this.seekBar.value;
    });

    this.backwardBtn.addEventListener("click", () => {
      this.video.currentTime = Math.max(0, this.video.currentTime - 10);
    });

    this.forwardBtn.addEventListener("click", () => {
      this.video.currentTime = Math.min(
        this.video.duration,
        this.video.currentTime + 10
      );
    });
    this.volumeBar.addEventListener("input", () => {
      const vol = parseFloat(this.volumeBar.value);
      this.video.volume = vol;
      if (vol === 0) {
        this.video.muted = true;
      } else {
        this.video.muted = false;
        this.previousVolume = vol;
      }
      this.muteBtn.textContent = this.video.muted ? "🔇" : "🔊";
      this.muteBtn.setAttribute(
        "data-tooltip",
        this.video.muted ? "Unmute" : "Mute"
      );
    });
    this.muteBtn.addEventListener("click", () => {
      if (this.video.muted || this.video.volume === 0) {
        const restore = this.previousVolume > 0 ? this.previousVolume : 1;
        this.video.muted = false;
        this.video.volume = restore;
        this.volumeBar.value = restore;
      } else {
        this.previousVolume =
          this.video.volume > 0 ? this.video.volume : this.previousVolume;
        this.video.muted = true;
        this.video.volume = 0;
        this.volumeBar.value = "0";
      }
      this.muteBtn.textContent = this.video.muted ? "🔇" : "🔊";
      this.muteBtn.setAttribute(
        "data-tooltip",
        this.video.muted ? "Unmute" : "Mute"
      );
    });
    this.container.addEventListener("mousemove", () => {
      if (this.isPlaying) {
        this.controls.classList.remove("hidden");
        this.hideControlsAfterDelay();
      }
    });
    this.video.addEventListener("volumechange", () => {
      const mutedNow = this.video.muted || this.video.volume === 0;
      this.muteBtn.textContent = mutedNow ? "🔇" : "🔊";
      this.muteBtn.setAttribute("data-tooltip", mutedNow ? "Unmute" : "Mute");
      if (!mutedNow && this.video.volume > 0) {
        this.previousVolume = this.video.volume;
      }
    });
    if (this.statusToggle) {
      this.boundToggleClick = () => {
        if (this.video.paused) this.video.play();
        else this.video.pause();
      };
      this.statusToggle.addEventListener("click", this.boundToggleClick);
    }
  }
  updateTimeDisplay() {
    const current = this.formatTime(this.video.currentTime);
    const total = this.formatTime(this.video.duration);
    this.timeDisplay.textContent = `${current} / ${total}`;
  }
  formatTime(time) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
  hideControlsAfterDelay() {
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.controls.classList.add("hidden");
      }
    }, 1000);
  }
}
