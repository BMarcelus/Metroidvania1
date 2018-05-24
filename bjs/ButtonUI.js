(function LoadButtonUI() {
  const { Entity, Input } = BDOTJS;
  class ButtonUI extends Entity {
    constructor(...args) {
      super(...args);
      this.hover = false;
    }
    update() {
      const { mouse } = Input;
      if (this.containsPoint(mouse)) {
        if (!this.hover) {
          this.hover = true;
          this.onHover();
        }
      } else if (this.hover) {
        this.hover = false;
        this.offHover();
      }
      if (mouse.down && this.hover) {
        this.held = true;
        this.onHeld();
        this.click();
      }
      if (mouse.up && this.held) {
        // if(this.held&&this.hover)this.click();
        this.held = false;
        this.offHeld();
      }
    }
  }

  BDOTJS.ButtonUI = ButtonUI;
}());
