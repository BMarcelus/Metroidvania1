(function LoadButtonUI() {
  const { Entity, Input } = BDOTJS;
  class Clickable extends Entity {
    constructor(...args) {
      super(...args);
      this.hover = false;
    }
    update() {
      const { mouse } = Input;
      if (this.containsPoint(mouse)) {
        if (!this.hover) {
          this.hover = true;
          if (this.onHover) this.onHover();
        }
      } else if (this.hover) {
        this.hover = false;
        if (this.offHover) this.offHover();
      }
      if (mouse.down && this.hover) {
        this.held = true;
        if (this.onHeld) this.onHeld();
        if (this.onClick) this.onClick();
      }
      if (mouse.up && this.held) {
        // if(this.held&&this.hover)this.click();
        this.held = false;
        if (this.offHeld) this.offHeld();
      }
    }
  }

  class ButtonUI extends Clickable {
    onHover() {
      this.x += 1;
    }
    offHover() {
      this.x -= 1;
    }
    onHeld() {
      this.y += 1;
    }
    offHeld() {
      this.y -= 1;
    }
    onClick() {
      this.w *= 2;
    }
  }

  class DraggableHeldUI extends Clickable {
    constructor(...args) {
      super(...args);
      this.heldOffset = { x: 0, y: 0 };
    }
    update() {
      super.update();
      if (this.held) {
        this.x = Input.mouse.x - this.heldOffset.x;
        this.y = Input.mouse.y - this.heldOffset.y;
      }
    }
    onHeld() {
      this.heldOffset.x = Input.mouse.x - this.x;
      this.heldOffset.y = Input.mouse.y - this.y;
    }
  }

  class DraggableUI extends Clickable {
    constructor(...args) {
      super(...args);
      this.on = false;
    }
    update() {
      super.update();
      if (this.on) {
        this.x = Input.mouse.x;
        this.y = Input.mouse.y;
      }
    }
    onClick() {
      this.on = !this.on;
      if (!this.on) {
        this.x -= this.w / 2;
        this.y -= this.h / 2;
      }
    }
  }

  BDOTJS.ButtonUI = ButtonUI;
  BDOTJS.DraggableUI = DraggableUI;
  BDOTJS.DraggableHeldUI = DraggableHeldUI;
}());
