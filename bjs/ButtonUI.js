(function LoadButtonUI() {
  const { Entity, Input } = BDOTJS;
  class ButtonUI extends Entity {
    // constructor(...args) {
    //   super(...args);
    // }
    update() {
      if (pointInRect(Input.mouse, this)) {
        this.hover = true;
      }
    }
  }

  BDOTJS.ButtonUI = ButtonUI;
}());
