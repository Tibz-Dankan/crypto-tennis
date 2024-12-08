const {
  makeLnPayment,
  fetchTransactionsForAccount,
} = require("../client/payment");

const sockEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("gameWinner", ({ winner }) => {
      console.log(`gameWinner: ${winner}`);

      const paymentSynchronizer = async () => {
        const paymentStatus = await makeLnPayment();
        if (paymentStatus.status === "SUCCESS") {
          const transactionFetch = await fetchTransactionsForAccount();
          if (transactionFetch.status === "SUCCESS") {
            console.log("Transactions fetched successfully!");
            socket.emit("transactions", transactionFetch.transactions);
          }
        }
      };
      paymentSynchronizer();
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = { sockEvents };
