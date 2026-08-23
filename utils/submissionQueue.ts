export interface IdentifiedSubmission {
  taskId: string;
  draftRevision: string;
}

export class SubmissionQueue<T extends IdentifiedSubmission> {
  private readonly items: T[] = [];
  private readonly seenRevisions = new Set<string>();
  private readonly finalizedIds = new Set<string>();

  enqueue(item: T) {
    if (this.seenRevisions.has(item.draftRevision)) return false;
    this.seenRevisions.add(item.draftRevision);
    this.items.push(item);
    return true;
  }

  dequeue() {
    return this.items.shift();
  }

  markFinalized(taskId: string) {
    if (this.finalizedIds.has(taskId)) return false;
    this.finalizedIds.add(taskId);
    return true;
  }

  releaseForRetry(taskId: string, draftRevision: string) {
    this.finalizedIds.delete(taskId);
    this.seenRevisions.delete(draftRevision);
  }
}

export function reconcilePendingIds(pendingIds: ReadonlySet<string>, taskIds: ReadonlySet<string>) {
  return new Set([...pendingIds].filter((id) => !taskIds.has(id)));
}
