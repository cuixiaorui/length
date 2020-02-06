import { YARD, FOOT, INCH } from "./consts";
export class Length {
  constructor(val, unit) {
    this.value = val;
    this.unit = unit;
  }

  equal(length){
    return this.value === length.getVal() && this.unit === length.getUnit();
  }

  getVal() {
    return this.value;
  }

  getUnit() {
    return this.unit;
  }

  isYard(unit) {
    return unit === YARD;
  }

  isFoot(unit) {
    return unit === FOOT;
  }

  isInch(unit) {
    return unit === INCH;
  }

  parseYard(u) {
    if (this.isFoot(u)) {
      return new Length(this.value * 3, u);
    } else if (this.isInch(u)) {
      return new Length(this.value * 36, u);
    }
    return this;
  }

  parseInch(u) {
    if (this.isYard(u)) {
      return new Length(this.value / 36, u);
    } else if (this.isFoot(u)) {
      return new Length(this.value / 12, u);
    }
    return this;
  }

  parseFoot(u) {
    if (this.isYard(u)) {
      return new Length(this.value / 3, u);
    } else if (this.isInch(u)) {
      return new Length(this.value * 12, u);
    }
    return this;
  }

  parseTo(u) {
    if (this.isYard(this.unit)) {
      return this.parseYard(u);
    }

    if (this.isInch(this.unit)) {
      return this.parseInch(u);
    }

    if (this.isFoot(this.unit)) {
      return this.parseFoot(u);
    }
  }
}
