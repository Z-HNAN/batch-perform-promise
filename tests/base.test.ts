import batchPerformPromise, { TaskPayload } from '../src/index';

describe('test batchPerform', () => {
  // 初始化
  const payloads = ['p1', 'p2', 'p3'];
  let tasksResolve: TaskPayload<string>[];
  let tasksReject: TaskPayload<string>[];
  let tasksResolveTimeout: TaskPayload<string>[];
  let tasksIndeterminate: TaskPayload<string>[];

  beforeAll(async () => {
    // 全通过
    // eslint-disable-next-line max-len
    tasksResolve = await batchPerformPromise<string>(payloads, async (value) => Promise.resolve(value));

    // 全不通过
    // eslint-disable-next-line max-len
    tasksReject = await batchPerformPromise<string>(payloads, async (value) => Promise.reject(Error(value)));

    // 全部超时通过
    // eslint-disable-next-line arrow-body-style
    tasksResolveTimeout = await batchPerformPromise<string>(payloads, async (value) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(value);
        }, 100);
      });
    });

    // 不确定执行结果
    tasksIndeterminate = await batchPerformPromise<string>(payloads, async (value) => {
      const now = Date.now();
      if (now % 2 === 0) {
        return value;
      // eslint-disable-next-line no-else-return
      } else {
        throw Error(value);
      }
    });
  });

  test('test length Be 3', () => {
    expect(tasksResolve.length).toBe(3);
    expect(tasksReject.length).toBe(3);
    expect(tasksResolveTimeout.length).toBe(3);
    expect(tasksIndeterminate.length).toBe(3);
  });

  test('test tasksIndeterminate to be Done', () => {
    expect(tasksIndeterminate[0].done).toBe(true);
    expect(tasksIndeterminate[1].done).toBe(true);
    expect(tasksIndeterminate[2].done).toBe(true);
  });

  test('test tasksResolveTimeout to be Done', () => {
    expect(tasksResolveTimeout[0].done).toBe(true);
    expect(tasksResolveTimeout[1].done).toBe(true);
    expect(tasksResolveTimeout[2].done).toBe(true);
  });

  test('test tasksResolveTimeout[2] Be Success ', () => {
    expect(tasksResolveTimeout[2]).toEqual({
      done: true,
      error: null,
      payload: 'p3',
      success: true,
    });
  });

  test('test tasksResolve[2] Be Success ', () => {
    expect(tasksResolve[2]).toEqual({
      done: true,
      error: null,
      payload: 'p3',
      success: true,
    });
  });

  test('test tasksReject[2] Be Error ', () => {
    expect(tasksReject[2]).toEqual({
      done: true,
      error: Error('p3'),
      payload: 'p3',
      success: false,
    });
  });
});
