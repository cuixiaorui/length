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

  isYard(unit){
      return unit === YARD;
  }

  isFoot(unit){
      return unit === FOOT;
  }

  isInch(unit){
      return unit === INCH;
  }

  parseTo(u) {
    let len = this;
    if (this.isYard(this.unit)) {
      if (this.isFoot(u)) {
        len = new Length(this.value * 3, u);
      } else if (this.isInch(u)) {
        len = new Length(this.value * 36, u);
      }
    }

    if (this.isInch(this.unit)) {
      if (this.isYard(u)) {
        len = new Length(this.value / 36, u);
      } else if (this.isFoot(u)) {
        len = new Length(this.value / 12, u);
      }
    }

    if (this.isFoot(this.unit)) {
      if (this.isYard(u)) {
        len = new Length(this.value / 3, u);
      } else if (this.isInch(u)) {
        len = new Length(this.value * 12, u);
      }
    }

    return len;
  }
}
