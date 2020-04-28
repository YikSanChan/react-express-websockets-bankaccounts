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

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ account_id, balance: newBalance }));
    }
  });

  return res.status(200).json({ balance: newBalance });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", function connection(ws, req) {
  console.log(`A new client (ip=${req.socket.remoteAddress}) connects`);
  console.log(`Current client count=${wss.clients.size}`);

  ws.on("close", () => {
    console.log("A client closes");
  });
});

server.listen(port, () =>
  console.log(`The server is listening at http://localhost:${port}`)
);
