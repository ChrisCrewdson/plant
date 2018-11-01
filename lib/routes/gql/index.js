const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./type-defs');
const resolvers = require('./resolvers');

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
