const passedKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

function createKeyboardEvent(type, key, code, keyCode) {
  return new KeyboardEvent(type, {
    key,
    code,
    keyCode,
    which: keyCode,
  });
}

function dispatchFakeKeyboardEvent(target, type, key, code, keyCode) {
  const event = createKeyboardEvent(type, key, code, keyCode);
  target.dispatchEvent(event);
}

class VideoEventBinder {
  constructor() {
    // this.videoContainer = null;
    // this.videoElement = null;
    // this.volumeElement = null;
    // this.progressElement = null;
    // this.previousVolume = 0; // out of 1?
    // this.muteHistory = [false, false]; // past two states
    // this.previousTime = 0; // seconds
    // this.volumeChangeListener = null;
    // this.timeUpdateListener = null;
    // this.volumePanelListener = null;
    // this.progressBarListener = null;
    // this.binded = false;
    this.bind();
  }

  bind() {
    if (this.bindElements()) {
      this.bindEvents();
      return true;
    }

    return false;
  }

  bindElements() {
    this.videoContainer = document.querySelector(".html5-video-player");
    this.videoElement = document.querySelector(".html5-main-video");
    this.volumeElement = document.querySelector(".ytp-volume-panel");
    this.progressElement = document.querySelector(".ytp-progress-bar");

    if (this.videoElement) {
      this.previousVolume = this.videoElement.volume;
      this.muteHistory = [this.videoElement.muted, this.videoElement.muted];
      this.previousTime = this.videoElement.currentTime;
    }

    // require every element, youtube shorts are missing volume element
    this.binded =
      this.videoElement && this.volumeElement && this.progressElement;

    return this.binded;
  }

  bindEvents() {
    this.volumeListener = () => {
      this.previousVolume = this.videoElement.volume;
      this.muteHistory[0] = this.muteHistory[1];
      this.muteHistory[1] = this.videoElement.muted;
    };

    this.timeListener = () => {
      this.previousTime = this.videoElement.currentTime;
    };

    this.volumePanelListener = this.createKeyHandler((e) => {
      switch (e.key) {
        case "ArrowLeft":
          if (this.previousVolume > 0) {
            dispatchFakeKeyboardEvent(
              e.target,
              e.type,
              "ArrowRight",
              "ArrowRight",
              39
            );

            if (this.muteHistory[0] && !this.videoElement.muted) {
              dispatchFakeKeyboardEvent(
                this.videoContainer,
                e.type,
                "m",
                "KeyM",
                77
              );
            }
          }
          break;
        case "ArrowRight":
          if (this.previousVolume < 1) {
            dispatchFakeKeyboardEvent(
              e.target,
              e.type,
              "ArrowLeft",
              "ArrowLeft",
              37
            );

            if (this.muteHistory[0] && !this.videoElement.muted) {
              dispatchFakeKeyboardEvent(
                this.videoContainer,
                e.type,
                "m",
                "KeyM",
                77
              );
            }
          }
          break;
      }
    });

    this.progressBarListener = this.createKeyHandler((e) => {
      switch (e.key) {
        case "ArrowUp":
          if (this.previousTime < this.videoElement.duration) {
            dispatchFakeKeyboardEvent(
              e.target,
              e.type,
              "ArrowDown",
              "ArrowDown",
              40
            );
          }
          break;
        case "ArrowDown":
          if (this.previousTime > 0) {
            dispatchFakeKeyboardEvent(
              e.target,
              e.type,
              "ArrowUp",
              "ArrowUp",
              38
            );
          }
          break;
      }
    });

    this.videoElement.addEventListener("volumechange", this.volumeListener);
    this.videoElement.addEventListener("timeupdate", this.timeListener);
    this.volumeElement.addEventListener("keydown", this.volumePanelListener);
    this.progressElement.addEventListener("keydown", this.progressBarListener);
  }

  unbind() {
    if (!this.binded) {
      return;
    }

    this.binded = false;

    this.videoElement.removeEventListener("volumechange", this.volumeListener);
    this.videoElement.removeEventListener("timeupdate", this.timeListener);
    this.volumeElement.removeEventListener("keydown", this.volumePanelListener);
    this.progressElement.removeEventListener(
      "keydown",
      this.progressBarListener
    );

    this.videoElement = null;
    this.volumeElement = null;
    this.progressElement = null;
  }

  createKeyHandler(reverser) {
    return (event) => {
      // our generated event
      if (!event.isTrusted) {
        return;
      }

      if (!passedKeys.includes(event.key)) {
        return;
      }

      // reverses previous handler effects
      // needed as we can't reorder event listeners
      reverser(event);

      this.videoElement.dispatchEvent(new KeyboardEvent(event.type, event));
      event.preventDefault();
      event.stopPropagation();
    };
  }
}

const videoBinder = new VideoEventBinder();

const observer = new MutationObserver((mutationList) => {
  if (!videoBinder.binded) {
    videoBinder.bind();
  }

  for (const mutation of mutationList) {
    for (const node of mutation.removedNodes) {
      if (node.contains(videoBinder.videoElement)) {
        videoBinder.unbind();
        break;
      }
    }
  }
});

observer.observe(document.body, { subtree: true, childList: true });
