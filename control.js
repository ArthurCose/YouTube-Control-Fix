const videoContainer = document.querySelector(".html5-video-player");
const videoElement = document.querySelector(".html5-main-video");

const passedKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

let previousVolume = videoElement.volume;
let muteHistory = [videoElement.muted, videoElement.muted];
let previousTime = videoElement.currentTime;

videoElement.addEventListener("volumechange", () => {
  console.log("volume", videoElement.volume, videoElement.muted);
  previousVolume = videoElement.volume;
  muteHistory[0] = muteHistory[1];
  muteHistory[1] = videoElement.muted;
});

videoElement.addEventListener("timeupdate", () => {
  previousTime = videoElement.currentTime;
});

function createKeyHandler(reverser) {
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

    videoElement.dispatchEvent(new KeyboardEvent(event.type, event));

    event.preventDefault();
    event.stopPropagation();
  };
}

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

document.querySelector(".ytp-volume-panel").addEventListener(
  "keydown",
  createKeyHandler((e) => {
    switch (e.key) {
      case "ArrowLeft":
        if (previousVolume > 0) {
          dispatchFakeKeyboardEvent(
            e.target,
            e.type,
            "ArrowRight",
            "ArrowRight",
            39
          );

          if (muteHistory[0] && !videoElement.muted) {
            dispatchFakeKeyboardEvent(videoContainer, e.type, "m", "KeyM", 77);
          }
        }
        break;
      case "ArrowRight":
        if (previousVolume < 1) {
          dispatchFakeKeyboardEvent(
            e.target,
            e.type,
            "ArrowLeft",
            "ArrowLeft",
            37
          );

          if (muteHistory[0] && !videoElement.muted) {
            dispatchFakeKeyboardEvent(videoContainer, e.type, "m", "KeyM", 77);
          }
        }
        break;
    }
  })
);

document.querySelector(".ytp-progress-bar").addEventListener(
  "keydown",
  createKeyHandler((e) => {
    switch (e.key) {
      case "ArrowUp":
        if (previousTime < videoElement.duration) {
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
        if (previousTime > 0) {
          dispatchFakeKeyboardEvent(e.target, e.type, "ArrowUp", "ArrowUp", 38);
        }
        break;
    }
  })
);
