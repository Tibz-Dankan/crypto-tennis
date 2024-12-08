const url = "http://localhost:4000/graphql";
const token = process.env.YOUR_API_TOKEN;

const makeLnPayment = () => {
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

  const variables = {
    input: {
      amount: 5,
      walletId: "fe20ccad-4c7e-4652-8e3c-af3dc5234009",
      lnAddress: "mmak3n@blink.sv",
    },
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: variables,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Parsed Data:", data);

      if (data.errors) {
        console.error("GraphQL Errors:", data.errors);
        return;
      }

      const paymentSendResult = data.data.lnAddressPaymentSend;
      if (paymentSendResult.status === "SUCCESS") {
        console.log("Payment sent successfully!");
      } else {
        console.error("Failed to send payment:", paymentSendResult.errors);
      }
    })
    .catch((error) => {
      console.error("Network or Fetch Error:", error);
    });
};

const fetchTransactionsForAccount = () => {
  const query = `
    query transactionsForAccount($first: Int) {
      me {
        id
        defaultAccount {
          transactions(first: $first) {
            pageInfo {
              endCursor
              hasNextPage
            }
            edges {
              cursor
              node {
                direction
                settlementCurrency
                settlementAmount
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
    first: 15,
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Parsed Data:", data);

      if (data.errors) {
        console.error("GraphQL Errors:", data.errors);
        return;
      }

      const transactions = data.data.me.defaultAccount.transactions;
      console.log("Transactions:", transactions);
    })
    .catch((error) => {
      console.error("Network or Fetch Error:", error);
    });
};

module.exports = { makeLnPayment, fetchTransactionsForAccount };
