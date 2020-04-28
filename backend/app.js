const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const WebSocket = require("ws");

const app = express();
const port = 8080;
const data = {};

app.use(cors());
app.use(morgan("combined"));

app.get("/account/:account_id/balance", (req, res) => {
  const { account_id } = req.params;
  const balance = data[account_id] || 0;
  return res.status(200).json({ balance });
});

app.post("/account/:account_id/deposit/:deposit", (req, res) => {
  const { account_id, deposit } = req.params;
  const balance = data[account_id] || 0;
  const newBalance = balance + parseInt(deposit);
  data[account_id] = newBalance;
  return res.status(200).json({ balance: newBalance });
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });

  ws.send("something");
});

server.listen(port, () =>
  console.log(`The server is listening at http://localhost:${port}`)
);
