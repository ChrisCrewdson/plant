// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
module.exports = {
  Query: {
    hello: () => 'Hello world!',
  },
};
