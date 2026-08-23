import { reconcilePendingIds, SubmissionQueue } from "@/utils/submissionQueue";

interface Request {
  taskId: string;
  draftRevision: string;
}

describe("SubmissionQueue", () => {
  it("keeps FIFO order and rejects a duplicate draft revision", () => {
    const queue = new SubmissionQueue<Request>();
    const first = { taskId: "one", draftRevision: "composer:1" };
    const second = { taskId: "two", draftRevision: "composer:2" };

    expect(queue.enqueue(first)).toBe(true);
    expect(queue.enqueue({ taskId: "duplicate", draftRevision: "composer:1" })).toBe(false);
    expect(queue.enqueue(second)).toBe(true);
    expect(queue.dequeue()).toEqual(first);
    expect(queue.dequeue()).toEqual(second);
  });

  it("finalizes each task once and can explicitly release a failed retry", () => {
    const queue = new SubmissionQueue<Request>();
    const request = { taskId: "one", draftRevision: "composer:1" };
    queue.enqueue(request);
    queue.dequeue();

    expect(queue.markFinalized(request.taskId)).toBe(true);
    expect(queue.markFinalized(request.taskId)).toBe(false);
    queue.releaseForRetry(request.taskId, request.draftRevision);
    expect(queue.enqueue(request)).toBe(true);
    expect(queue.markFinalized(request.taskId)).toBe(true);
  });

  it("removes optimistic IDs observed in a Firestore snapshot", () => {
    const pending = new Set(["local-1", "local-2"]);
    const snapshot = new Set(["remote", "local-1"]);

    expect([...reconcilePendingIds(pending, snapshot)]).toEqual(["local-2"]);
  });
});
