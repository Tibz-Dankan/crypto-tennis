const { makeLnPayment } = require("../client/payment");

const sockEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("gameWinner", ({ winner }) => {
      console.log(`gameWinner: ${winner}`);
      makeLnPayment();
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = { sockEvents };
