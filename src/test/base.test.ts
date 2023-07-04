import { batchPerformPromise, TaskState } from '../index';

describe('test batchPerform', () => {
  test('all success', async () => {
    const payloads = ['p1', 'p2', 'p3'];

    const tasksResolve = await batchPerformPromise(payloads, async (value) => Promise.resolve(`-${value}-`));

    expect(tasksResolve.length).toBe(3)
    expect(tasksResolve.every(task => task.done === true)).toBeTruthy()
    expect(tasksResolve.every(task => task.success === true)).toBeTruthy()
    expect(tasksResolve.every(task => task.error === null)).toBeTruthy()
    expect(tasksResolve[0]).toEqual({
      done: true,
      success: true,
      error: null,
      task: 'p1',
      taskRes: '-p1-',
      payload: 'p1'
    })
  })

  test('all error', async () => {
    const payloads = ['p1', 'p2', 'p3'];

    const tasksReject = await batchPerformPromise(payloads, async payload => {
      if (payload === 'p1') {
        throw Error('throw error p1')
      } else if (payload === 'p2') {
        return Promise.reject('return Promise.reject p2')
      } else {
        return Promise.reject(payload)
      }
    });

    expect(tasksReject.length).toBe(3)
    expect(tasksReject.every(task => task.done === true)).toBeTruthy()
    expect(tasksReject.every(task => task.success === false)).toBeTruthy()
    expect(tasksReject.every(task => task.error !== null)).toBeTruthy()
    expect(tasksReject[2]).toEqual({
      done: true,
      success: false,
      error: 'p3',
      task: 'p3',
      taskRes: undefined,
      payload: 'p3'
    })

    expect(tasksReject[0].error?.message).toBe('throw error p1') // throw Error('throw error p1')
    expect(tasksReject[1].error).toBe('return Promise.reject p2') // return Promise.reject('return Promise.reject p2')
  })

  test('test time, do not finish', async () => {
    const sleep = (timeout: number) => new Promise<void>(resolve => setTimeout(() => resolve(), timeout))
    
    /**
     * [0] (p1, p2)
     * [100] (p3, p4) p1, p2
     * [200] (p5) p1, p2, p3, p4
     * [300] p1, p2, p3, p4, p5
     */
    const payloads = ['p1', 'p2', 'p3', 'p4', 'p5'];
    let taskResPromise = Promise.resolve() as unknown as ReturnType<typeof batchPerformPromise<string, void>>;

    const execFlag = await (new Promise(resolve => {
      setTimeout(() => resolve('timeout'), 250) // win

      taskResPromise = batchPerformPromise(payloads, async (value) => sleep(100), 2)
      taskResPromise.then(() => resolve('batch perform'))
    }));

    const tasksRes = taskResPromise.getTaskStateList()

    expect(execFlag).toBe('timeout')

    expect(tasksRes.length).toBe(5)

    const finishTasksRes = tasksRes.slice(0, 4);
    const notFinishTasksRes = tasksRes.slice(5);

    expect(finishTasksRes.every(task => task.done === true)).toBeTruthy()
    expect(finishTasksRes.every(task => task.success === true)).toBeTruthy()
    expect(finishTasksRes.every(task => task.error === null)).toBeTruthy()


    expect(notFinishTasksRes.every(task => task.done === false)).toBeTruthy()
    expect(notFinishTasksRes.every(task => task.success === false)).toBeTruthy()
    expect(notFinishTasksRes.every(task => task.error === null)).toBeTruthy()
  })

  test('test time, one by one', async () => {
    const sleep = (timeout: number) => new Promise<void>(resolve => setTimeout(() => resolve(), timeout))
    
    /**
     * [0] (p1, p2)
     * [50] (p2, p3) p1
     * [100] (p3, p4) p1, p2
     * [150] (p3, p5) p1, p2, p4
     * [200] (p3) p1, p2, p4, p5
     * [250] p1, p2, p4, p5, p3
     */
    const payloads = ['p1', 'p2', 'p3', 'p4', 'p5']; // p1, p2 [100], p3, p4[200], p5[300]

    const tasksResPromise = batchPerformPromise(payloads, async (value) => {
      switch (value) {
        case 'p1':
          return sleep(50)
        case 'p2':
          return sleep(100);
        case 'p3':
          return sleep(200);
        default: 
          return sleep(50);
      }
    }, 2);

    // 100ms point
    sleep(110).then(() => {
      const tasksRes = tasksResPromise.getTaskStateList();

      expect(tasksRes[0].done === true).toBeTruthy()
      expect(tasksRes[1].done === true).toBeTruthy()

      expect(tasksRes[3].done === false).toBeTruthy()
      expect(tasksRes[2].done === false).toBeTruthy()
      expect(tasksRes[4].done === false).toBeTruthy()
    })

    // 200ms point
    sleep(210).then(() => {
      const tasksRes = tasksResPromise.getTaskStateList();

      expect(tasksRes[0].done === true).toBeTruthy()
      expect(tasksRes[1].done === true).toBeTruthy()
      expect(tasksRes[3].done === true).toBeTruthy()
      expect(tasksRes[4].done === true).toBeTruthy()

      expect(tasksRes[2].done === false).toBeTruthy()
    })

    // 300ms point
    sleep(310).then(() => {
      const tasksRes = tasksResPromise.getTaskStateList();

      expect(tasksRes[0].done === true).toBeTruthy()
      expect(tasksRes[1].done === true).toBeTruthy()
      expect(tasksRes[3].done === true).toBeTruthy()
      expect(tasksRes[4].done === true).toBeTruthy()
      expect(tasksRes[2].done === true).toBeTruthy()
    })

    tasksResPromise
      .then(tasksRes => {
        // END
        expect(tasksRes.length).toBe(5)
        expect(tasksRes.every(task => task.done === true)).toBeTruthy()
        expect(tasksRes.every(task => task.success === true)).toBeTruthy()
        expect(tasksRes.every(task => task.error === null)).toBeTruthy()
      })

    // 500ms point
    await sleep(500)
    const tasksRes = tasksResPromise.getTaskStateList();
    expect(tasksRes.length).toBe(5)
    expect(tasksRes.every(task => task.done === true)).toBeTruthy()
    expect(tasksRes.every(task => task.success === true)).toBeTruthy()
    expect(tasksRes.every(task => task.error === null)).toBeTruthy()
  })
});