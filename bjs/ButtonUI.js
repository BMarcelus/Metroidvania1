(function LoadButtonUI() {
  const { Entity, Input, Driver } = BDOTJS;
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

  function TextRender(canvas) {
    const { x, y, w, h, color, text, background, centered } = this;
    canvas.fillStyle = background;
    canvas.fillRect(x, y, w, h);
    canvas.fillStyle = color;
    let tx = x;
    if (centered) {
      canvas.textAlign = 'center';
      tx += w / 2;
    }
    canvas.fillText(text, tx, y + (h / 2), w);
  }

  class ButtonUI extends Clickable {
    constructor(text, onclick, ...args) {
      super(...args);
      this.onclick = onclick;
      this.text = text;
    }
    initRenderer() {
      this.text = 'button';
      this.color = '#fff';
      this.background = '#000';
      this.centered = true;
      this.draw = TextRender;
    }
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
      if (this.onclick) this.onclick();
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
    containsPoint(point) {
      if (this.on && point.mouse) return true;
      return super.containsPoint(point);
    }
  }

  class TrollButtonUI extends Clickable {
    constructor(text, onclick, ...args) {
      super(...args);
      this.onclick = onclick;
      this.text = text;
      this.forwards = true;
      this.down = true;
    }
    update()
    {
      super.update();
      const { mouse } = Input;
      if (this.containsPoint(mouse)) {
        this.onHover();
      }
    }
    initRenderer() {
      this.text = 'button';
      this.color = '#fff';
      this.background = '#000';
      this.centered = true;
      this.draw = TextRender;
    }
    onHover() {
      do {
        this.x = Math.random() * (Driver.getCanvas().canvas.width - this.w);
        this.y = Math.random() * (Driver.getCanvas().canvas.height - this.h);
      } while(this.containsPoint(Input.mouse));
    }
    offHover() {
    }
    onHeld() {
      this.y += 1;
    }
    offHeld() {
      this.y -= 1;
    }
    onClick() {
      if (this.onclick) this.onclick();
    }
  }

  class ItemButtonUI extends Clickable {
    constructor(item, user, inv, ...args) {
      super(...args);
      this.item = item;
      this.text = item.name;
      this.user = user;
      this.inv = inv;
    }
    initRenderer() {
      this.text = 'button';
      this.color = '#fff';
      this.background = '#000';
      this.centered = true;
      this.draw = TextRender;
    }
    onClick() {
      this.item.useItem(this.user);
      this.inv.setupUI();
    }
  }

  BDOTJS.ItemButtonUI = ItemButtonUI;
  BDOTJS.ButtonUI = ButtonUI;
  BDOTJS.DraggableUI = DraggableUI;
  BDOTJS.DraggableHeldUI = DraggableHeldUI;
  BDOTJS.TrollButtonUI = TrollButtonUI;
}());
