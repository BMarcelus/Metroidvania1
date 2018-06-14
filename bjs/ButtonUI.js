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
    let ty = y;
    if (centered) {
      canvas.textAlign = 'center';
      tx += w / 2;
      ty += 7 * h / 12;
    }
    canvas.fillText(text, tx, ty, w);
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

  class BasicText extends Clickable {
    constructor(text, ...args) {
      super(...args);
      this.text = text;
    }
    initRenderer() {
      this.text = 'button';
      this.color = '#fff';
      this.background = '#000';
      this.centered = true;
      this.draw = TextRender;
    }
  }

  class ItemButtonUI extends DraggableHeldUI {//Clickable {
    constructor(item, user, inv, draggable, ...args) {
      super(...args);
      this.item = item;
      this.text = item.name;
      this.user = user;
      this.inv = inv;
      this.tolerance = 10;
      this.moved = false;
      this.draggable = draggable;
    }
    initRenderer() {
      this.text = 'button';
      this.color = '#fff';
      this.background = '#000';
      this.centered = true;
      this.draw = TextRender;
    }
    update() {
      if(this.draggable) {
        super.update();
        if (!this.moved && Math.abs(this.x - this.prevX) > this.tolerance || Math.abs(this.y - this.prevY) > this.tolerance) {
          this.moved = true;
        }
      }
    }
    onClick() {
      this.prevX = this.x;
      this.prevY = this.y;
      this.moved = false;
    }
    offHeld() {
      let index;
      if (!this.moved) {
        this.item.useItem(this.user);
        this.inv.refresh();
      } else if ( (index = this.overSlot(this.inv.slots) ) != -1 && this.inv.items[index] == null) {
        this.inv.removeItem(this.item);
        this.inv.items[index] = this.item;
        this.inv.refresh();
      } else {
        this.x = this.prevX;
        this.y = this.prevY;
      }
    }
    overSlot(slots) {
      for (var x = 0; x < slots.length; ++x) {
        if(slots[x].containsPoint(Input.mouse)) {
          return x;
        }
      }
      return -1;
    }
  }

  BDOTJS.ItemButtonUI = ItemButtonUI;
  BDOTJS.ButtonUI = ButtonUI;
  BDOTJS.DraggableUI = DraggableUI;
  BDOTJS.DraggableHeldUI = DraggableHeldUI;
  BDOTJS.TrollButtonUI = TrollButtonUI;
  BDOTJS.BasicText = BasicText;
}());
