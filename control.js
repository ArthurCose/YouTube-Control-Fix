const forwardedKeys = [
  "Space",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
];

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
    // this.targetElement = null;
    // this.keyDownListener = null;
    // this.binded = false;

    this.createListeners();
    this.bind();
  }

  createListeners() {
    this.keyDownListener = (e) => {
      if (!e.isTrusted) {
        // our generated event
        return;
      }

      if (!forwardedKeys.includes(e.code)) {
        // we don't recognize this key
        return;
      }

      dispatchFakeKeyboardEvent(
        this.forwardElement,
        e.type,
        e.key,
        e.code,
        e.keyCode
      );

      e.preventDefault();
    };
  }

  bind() {
    if (this.bindElements()) {
      this.bindEvents();
      return true;
    }

    return false;
  }

  bindElements() {
    this.playerElement = document.querySelector("#content #player-container");
    this.forwardElement = this.playerElement?.querySelector("#movie_player");

    this.binded = this.playerElement && this.forwardElement;

    return this.binded;
  }

  bindEvents() {
    this.playerElement.addEventListener("keydown", this.keyDownListener, true);
  }

  unbind() {
    if (!this.binded) {
      return;
    }

    this.binded = false;

    this.playerElement = null;
    this.forwardElement = null;
  }
}

const videoBinder = new VideoEventBinder();

const observer = new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    for (const node of mutation.removedNodes) {
      if (
        node == videoBinder.playerElement ||
        node.contains(videoBinder.playerElement)
      ) {
        videoBinder.unbind();
        break;
      }
    }
  }

  if (!videoBinder.binded) {
    videoBinder.bind();
  }
});

observer.observe(document.body, { subtree: true, childList: true });
