require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const initSocket = require("./src/sockets/socket.server");
const http = require("http");

const httpServer = http.createServer(app);

connectDB();

initSocket(httpServer);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
