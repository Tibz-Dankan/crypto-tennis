const { fetchTransactionsForAccount } = require("../client/payment");

fetchTransactionsForAccount();

const resolvers = {
  Query: {
    me: async () => {
      // Simulating an actual user ID
      const userId = "user-123";
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
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  query: query,
                  variables: variables,
                }),
              });

              console.log("response: ", response);

              //   const data = await response.json();

              //   if (data.errors) {
              //     console.error("GraphQL Errors:", data.errors);
              //     return null;
              //   }

              //   const transactions = data.data.me.defaultAccount.transactions;
              //   return transactions;
            } catch (error) {
              console.error("Network or Fetch Error:", error);
              //   return null;
            }
          },
        },
      };
    },
  },
};

module.exports = { resolvers };
