const { gql } = require('apollo-server-express');

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
module.exports = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.
  # The "Query" type is the root of all GraphQL queries.
  type Query {
    hello: String
  }
`;
