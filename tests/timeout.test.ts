import batchPerformPromise from '../src/index';
// 延长测试超时10s
jest.setTimeout(10000);

// 使用timeout验证batch效果
describe('test batch with timeout', () => {
  // 初始化

  const payloads = ['p1', 'p2', 'p3', 'p4', 'p5'];

  // 延迟执行函数的方法(timeout模拟)
  const delayFnFactory = (timeoutMS: number) => (payload: string) => new Promise((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve(payload);
    }, timeoutMS);
  });

  // 测试时间差距，精度100ms(定时器不准)
  const timeDiff = (excepted: number, time1: number, time2: number): boolean => {
    const absoluteDiff = Math.abs(time2 - time1);
    return Math.abs(absoluteDiff - excepted) <= 100;
  };

  test('dealy 1s/p use 2 promise perform, total 3s', async () => {
    expect.assertions(1);

    const start = Date.now();
    await batchPerformPromise(payloads, delayFnFactory(1000));
    const end = Date.now();

    // 应该在2.5s内执行完毕
    expect(timeDiff(3000, start, end)).toBe(true);
  });

  test('dealy 1s/p use 5 promise perform, total 1s', async () => {
    expect.assertions(1);

    const start = Date.now();
    await batchPerformPromise(payloads, delayFnFactory(1000), 5);
    const end = Date.now();

    // 应该在1s内执行完毕
    expect(timeDiff(1000, start, end)).toBe(true);
  });

  test('dealy 3s/p use 3 promise perform, total 6s', async () => {
    expect.assertions(1);

    const start = Date.now();
    await batchPerformPromise(payloads, delayFnFactory(3000), 3);
    const end = Date.now();

    // 应该在6s内执行完毕
    expect(timeDiff(6000, start, end)).toBe(true);
  });

  test('dealy 3s/p use 10 promise perform, total 3s', async () => {
    expect.assertions(1);

    const start = Date.now();
    await batchPerformPromise(payloads, delayFnFactory(3000), 10);
    const end = Date.now();

    // 应该在3s内执行完毕
    expect(timeDiff(3000, start, end)).toBe(true);
  });
});
