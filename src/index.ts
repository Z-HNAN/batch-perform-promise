/**
 * 批量执行Promise任务
 */

export type TaskPayload<T> = {
  done: boolean;
  success: boolean;
  error: Error | null;
  payload: T;
};

class BatchPerfromer<T> {
  // 当前获得的任务
  tasks: TaskPayload<T>[];

  // 当前未执行的任务
  undoTasks: TaskPayload<T>[];

  // promise任务链最大并发数
  concurrentSize: number;

  // 当前执行的任务回调
  callback: (value: T) => Promise<any>;

  // 当前batcher执行完任务
  resolve: (value?: any) => void;

  // 当前执行的任务
  performWorks: Promise<any>[];

  constructor(tasks: T[], callback: (value: T) => Promise<any>, concurrentSize: number) {
    this.tasks = tasks.map((t) => ({ done: false, success: true, error: null, payload: t }));
    this.concurrentSize = concurrentSize;
    this.undoTasks = [...this.tasks];
    this.callback = callback;
    this.performWorks = [];
    this.resolve = () => undefined;
  }

  // 当前是否可以继续放任务
  shouldPerform(): boolean {
    return this.performWorks.length < this.concurrentSize;
  }

  // 启动任务
  async exec(): Promise<any> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.beginWork();
    });
  }

  // 开始批量操作
  async beginWork(): Promise<any> {
    // 出口条件,没有剩余的任务,并且所有任务已经done
    if (this.undoTasks.length <= 0 && this.tasks.every((t) => t.done === true)) {
      this.resolve();
    }

    // 放入任务
    while (this.shouldPerform() === true && this.undoTasks.length > 0) {
      const nextTask = this.undoTasks.shift();
      if (nextTask) {
        this.performWork(nextTask);
      }
    }
  }

  // 开始执行任务
  async performWork(task: TaskPayload<T>): Promise<any> {
    // 当前任务压入队列
    const performPromise = this.callback(task.payload);
    this.performWorks.push(performPromise);

    try {
      // 执行任务
      await performPromise;
      // success
      task.success = true;
      task.error = null;
    } catch (error) {
      // error
      task.success = false;
      task.error = error as Error;
    } finally {
      task.done = true;
      // 去除该元素
      const currentPromiseIdx = this.performWorks.indexOf(performPromise);
      this.performWorks = [
        ...this.performWorks.slice(0, currentPromiseIdx),
        ...this.performWorks.slice(currentPromiseIdx + 1),
      ];
      // 标志此任务完成
      this.beginWork();
    }
  }
}

/**
 * 批量执行Promise的方法
 * @param tasks 需要被Promise执行的任务队列
 * @param callback 执行Promise的方法
 * @param concurrentSize 并发执行Promise数量.default=2
 */
async function batchPerformPromise<T>(
  tasks: T[],
  callback: (value: T) => Promise<any>,
  concurrentSize = 2,
): Promise<TaskPayload<T>[]> {
  // 初始化
  const batchPerfromer = new BatchPerfromer<T>(tasks, callback, concurrentSize);

  // 执行批量操作
  await batchPerfromer.exec();

  // 返回操作结果
  return batchPerfromer.tasks;
}

export default batchPerformPromise;
