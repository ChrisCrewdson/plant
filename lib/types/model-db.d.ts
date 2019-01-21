// Helper shapes for DB

// This is what an Update via the Mongo driver result returns:
interface UpdateWriteOpResultResult {
  ok: number;
  n: number;
  nModified: number;
}
