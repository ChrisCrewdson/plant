const { ApolloServer, gql } = require('apollo-server-express');

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.
  # The "Query" type is the root of all GraphQL queries.
  type Query {
    hello: String
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

/**
 * Setup GraphQL server endpoint
 * @param {import("express").Application} app - Express application
 * @returns {Promise<void>}
 */
module.exports = async (app) => {
  const path = '/gql';
  await server.applyMiddleware({ app, path });
};
