class Action {
  constructor(value) {
    actionValue(value);
  }

  get actionValue() {
    return this.value;
  }

  set actionValue(value) {
    this.value = value;
  }
}