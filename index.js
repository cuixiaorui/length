import { YARD, FOOT, INCH } from "./consts";
export class Length {
  constructor(val, uint) {
    this.value = val;
    this.unit = uint;
  }

  getVal() {
    return this.value;
  }

  getUint() {
    return this.unit;
  }

  parseTo(u) {
    let len = this;
    if (this.unit === YARD) {
      if (u === FOOT) {
        len = new Length(this.value * 3, u);
      } else if (u === INCH) {
        len = new Length(this.value * 36, u);
      }
    }

    if (this.unit === INCH) {
      if (u === YARD) {
        len = new Length(this.value / 36, u);
      } else if (u === FOOT) {
        len = new Length(this.value / 12, u);
      }
    }

    if (this.unit === FOOT) {
      if (u === YARD) {
        len = new Length(this.value / 3, u);
      } else if (u === INCH) {
        len = new Length(this.value * 12, u);
      }
    }

    return len;
  }
}
