// import { cloneDeep } from 'lodash';
import Semaphore from "./semaphore";
import clone from './clone.js';

export type TaskState<Task, TaskRes = void> = {
  done: boolean;
  success: boolean;
  error: Error | null;
  task: Task,
  taskRes: TaskRes | undefined,
  /** @deprecated 已过时，旧版本是原任务，该字段不是很合理，拆分为task, taskRes */
  payload: Task;
};

interface BatchPerformPromise<Task, TaskRes> extends Promise<TaskState<Task, TaskRes>[]> {
  getTaskStateList: () => Array<TaskState<Task, TaskRes>>
}

/**
 * 批量执行Promise的方法
 * @param tasks 需要被Promise执行的任务队列
 * @param callback 执行Promise的方法
 * @param concurrentSize 并发执行Promise数量.default=2
 */
function batchPerformPromise<Task, TaskRes = void>(
  tasks: Task[],
  callback: (value: Task) => Promise<TaskRes>,
  concurrentSize = 2,
): BatchPerformPromise<Task, TaskRes> {
  const taskStateList: TaskState<Task, TaskRes>[] = tasks.map(task => ({ done: false, success: false, error: null, task: task, taskRes: undefined, payload: task }));
  const semaphore = new Semaphore(concurrentSize);

  const batchPromise = new Promise<TaskState<Task, TaskRes>[]>(async resolve => {
    const taskExecList = taskStateList.map(taskState => async () => {
      await semaphore.acquire();
      try {
        taskState.taskRes = await callback(taskState.task);
        taskState.success = true;
        taskState.error = null;
      } catch (err) {
        taskState.success = false;
        taskState.error = err as Error;
      } finally {
        taskState.done = true;
        await semaphore.release();
      }
    })
    await Promise.all(taskExecList.map(taskExec => taskExec()));
    
    resolve(taskStateList);
  }) as BatchPerformPromise<Task, TaskRes>;

  batchPromise.getTaskStateList = () => clone(taskStateList);

  return batchPromise;
}

export { batchPerformPromise }
