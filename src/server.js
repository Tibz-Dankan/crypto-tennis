const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { sockEvents } = require("./socket");
const logger = require("morgan");
const cors = require("cors");
const keepActiveRoute = require("./activeRoute");

dotenv.config();

const typeDefs = gql`
  type Query {
    me: User
    hello: String
  }

  type User {
    id: ID!
    defaultAccount: Account
  }

  type Account {
    transactions(
      walletIds: [String]
      last: Int
      after: String
    ): TransactionsPayload
  }

  type TransactionsPayload {
    pageInfo: PageInfo
    edges: [TransactionEdge]
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean
  }

  type TransactionEdge {
    cursor: String
    node: Transaction
  }

  type Transaction {
    direction: String
    settlementCurrency: String
    settlementDisplayAmount: Float
    status: String
    createdAt: String
  }

  type Mutation {
    lnAddressPaymentSend(input: LnAddressPaymentSendInput!): PaymentResponse
  }

  input LnAddressPaymentSendInput {
    amount: Int!
    lnAddress: String!
    walletId: String!
  }

  type PaymentResponse {
    status: String
    errors: [Error]
  }

  type Error {
    code: String
    message: String
    path: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
    me: async () => {
      const url = "https://api.blink.sv/graphql";
      const token = process.env.API_TOKEN;
      const userId = "user-123"; //TODO: to replace it with the actual id
      return {
        id: userId,
        defaultAccount: {
          transactions: async (_, args) => {
            const query = `
              query me($walletIds: [String], $last: Int, $after: String) {
                me {
                  id
                  defaultAccount {
                    transactions(walletIds: $walletIds, last: $last, after: $after) {
                      pageInfo {
                        endCursor
                        hasNextPage
                      }
                      edges {
                        cursor
                        node {
                          direction
                          settlementCurrency
                          settlementDisplayAmount
                          status
                          createdAt
                        }
                      }
                    }
                  }
                }
              }
            `;

            const variables = {
              walletIds: args.walletIds,
              last: args.last || 10,
              after: args.after || null,
            };

            try {
              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  // Authorization: `Bearer ${token}`,
                  "X-API-KEY": `${token}`,
                },
                body: JSON.stringify({
                  query: query,
                  variables: variables,
                }),
              });

              // const data = await response.json();

              console.log("transaction query response:", response);

              // if (data.errors) {
              //   console.error("GraphQL Errors:", data.errors);
              //   return null;
              // }

              // const transactions = data.data.me.defaultAccount.transactions;
              // return transactions;
            } catch (error) {
              console.error("Network or Fetch Error:", error);
              // return null;
            }
          },
        },
      };
    },
  },
  Mutation: {
    lnAddressPaymentSend: async (_, { input }) => {
      const url = "https://api.blink.sv/graphql";
      const token = process.env.API_TOKEN;

      const mutation = `
        mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
          lnAddressPaymentSend(input: $input) {
            status
            errors {
              code
              message
              path
            }
          }
        }
      `;

      const variables = { input };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": `${token}`,
          },
          body: JSON.stringify({
            query: mutation,
            variables: variables,
          }),
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (response.ok) {
          return data.data.lnAddressPaymentSend;
        } else {
          console.error("Error:", data);
          return {
            status: "FAILURE",
            errors: data.errors || [
              { code: "UNKNOWN", message: "Unknown error" },
            ],
          };
        }
      } catch (error) {
        console.error("Error:", error);
        return {
          status: "FAILURE",
          errors: [{ code: "NETWORK_ERROR", message: error.message }],
        };
      }
    },
  },
};

const startServer = async () => {
  const app = express();
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(keepActiveRoute);

  dotenv.config();

  let allowOrigin;

  if (process.env.NODE_ENV === "production") {
    app.use(cors({ origin: "*" }));
    allowOrigin = "https://crypto-tennis.netlify.app";
  } else {
    app.use(cors());
    allowOrigin = "http://localhost:8080";
  }

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: allowOrigin,
      methods: ["GET", "POST"],
    },
  });

  sockEvents(io);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
