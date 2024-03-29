# batch-perform-promise

> 5.0版本使用father打包+semaphore实现

批量执行promise的方法，能够自定义“并行”发出的promise的个数

> 并行: promise发出等待时，为并行等待，由于js单线程，发出多个promise时是同步执行的，等待为并行，整体上有一种并行执行promise的感觉


## 快速启动

### 并行发出任务

```ts
import { batchPerformPromise } from 'batch-perform-promise';

// 准备任务以及处理函数
const payloads = ['p1', 'p2', 'p3'];
const handler = async (value: string) => Promise.resolve(value)

// await方式异步调用
const tasks = await batchPerformPromise<string>(payloads, handler);

// 查看调用结果 task
tasks[0] === {
  done: true,
  error: null,
  payload: 'p1',
  success: true,
}
```

### 并行执行时间

```ts
import { batchPerformPromise } from 'batch-perform-promise';

// 准备任务以及处理函数
const payloads = ['p1', 'p2', 'p3', 'p4', 'p5'];
// 处理函数，每2000ms执行完成一个promise
const handler = (payload: string) => new Promise((resolve) => {
  const timer = setTimeout(() => {
    clearTimeout(timer);
    resolve(payload);
  }, 2000);
});

// await方式异步调用
await batchPerformPromise<string>(payloads, handler);

// 一共执行时间6s
// [p1, p2] 2s
// [p3, p4] 2s
// [p5,   ] 2s
//  共计6s
```

更多使用方式参考test文件
