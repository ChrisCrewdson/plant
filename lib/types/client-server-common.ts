// These are the shapes of JSON objects passed between the client and the
// server.

/**
 * POST /api/notes
 * This is the payload sent by the client and received by the server
 */
interface LoadNotesRequestPayload {
  plantIds?: string[];
  noteIds?: string[];
}
