export default class Semaphore {
  private value: number;
  private list: Array<() => void> = [];

  constructor(value: number) {
    this.value = value;
  }

  public async acquire(n = 1) {
    let i = 0;
    const promises: Array<Promise<void>> = [];

    while(i < n) {
      this.value = this.value - 1;

      if (this.value < 0) {
        promises.push(this.lock());
      }

      i++;
    }

    await Promise.all(promises);
  }

  public async release(n = 1) {
    let i = 0;
    while (i < n) {
      this.value = this.value + 1;
      this.wakeUp();
      i++;
    }
  }

  private async lock() {
    return new Promise<void>(resolve => {
      this.list.push(() => resolve())
    })
  }

  private wakeUp() {
    const unlock = this.list.shift();

    if (unlock) {
      unlock();
    }
  }
}
