const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { sockEvents } = require("./socket");
const logger = require("morgan");
const cors = require("cors");
const keepActiveRoute = require("./activeRoute");

const typeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    lnAddressPaymentSend(input: LnAddressPaymentSendInput!): PaymentResponse
  }

  type Mutation {
    onChainAddressCurrent(
      input: OnChainAddressCurrentInput!
    ): OnChainAddressPayload
  }

  input LnAddressPaymentSendInput {
    amount: Int!
    lnAddress: String!
    walletId: String!
  }

  input OnChainAddressCurrentInput {
    amount: Int!
    onChainAddress: String!
    btcWalletId: String!
  }

  type OnChainAddressPayload {
    address: String
    errors: [Error]
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

        console.log("status", response.status);

        const text = await response.text();
        console.log("response text:", text);
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
