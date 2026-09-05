export interface QueueJob<T = any> {
  id: string;
  data: T;
}

export interface WorkerHandler<T = any> {
  (job: QueueJob<T>): Promise<any>;
}

export class SimpleQueue<T = any> {
  private handlers: WorkerHandler<T>[] = [];

  constructor(public name: string) {}

  async add(jobName: string, data: T, _opts?: any): Promise<QueueJob<T>> {
    const job: QueueJob<T> = { id: `${this.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, data };
    setImmediate(async () => {
      for (const h of this.handlers) {
        try {
          await h(job);
        } catch (err) {
          console.error(`Error processing job in ${this.name}:`, err);
        }
      }
    });
    return job;
  }

  process(handler: WorkerHandler<T>) {
    this.handlers.push(handler);
  }
}

export const aiQueue = new SimpleQueue('ai.understand');
export const matchQueue = new SimpleQueue('challenge.match');
