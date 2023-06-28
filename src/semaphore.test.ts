import Semaphore from "./semaphore"

test('semaphore block', async () => {
  // no use await
  const semaphore1 = new Semaphore(1);
  const execFlag1 = await (new Promise(resolve => {
    setTimeout(() => resolve('timer'), 100);

    (async () => {
      semaphore1.acquire()
      semaphore1.acquire()
      resolve('semaphore')
      semaphore1.release()
      semaphore1.release()
    })()
  }))
  expect(execFlag1).toBe('semaphore');

  // use await
  const semaphore2 = new Semaphore(1);
  const execFlag2 = await (new Promise(resolve => {
    setTimeout(() => resolve('timer'), 100);

    (async () => {
      await semaphore2.acquire()
      await semaphore2.acquire()
      resolve('semaphore')
      await semaphore2.release()
      await semaphore2.release()
    })()
  }))
  expect(execFlag2).toBe('timer');

  const semaphore3 = new Semaphore(1);
  const execFlag3 = await (new Promise(resolve => {
    setTimeout(() => resolve('timer'), 100);

    (async () => {
      await semaphore3.acquire()
      await semaphore3.release()
      await semaphore3.acquire()
      await semaphore3.release()
      resolve('semaphore')
    })()
  }))
  expect(execFlag3).toBe('semaphore');
})

test('semaphore 1 value', async () => {
  const semaphore1 = new Semaphore(1);
  const execFlag1 = await (new Promise(resolve => {
    setTimeout(() => resolve('timer'), 100);

    (async () => {
      await semaphore1.acquire(1);
      await semaphore1.release(1);
      resolve('semaphore')
    })()
  }))
  expect(execFlag1).toBe('semaphore');

  const semaphore2 = new Semaphore(1);
  const execFlag2 = await (new Promise(resolve => {
    setTimeout(() => resolve('timer'), 100);

    (async () => {
      await semaphore2.acquire(1);
      await semaphore2.acquire(1);
      resolve('semaphore')
    })()
  }))
  expect(execFlag2).toBe('timer');
})
