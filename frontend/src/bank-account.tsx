import React, { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams } from "react-router-dom";

const SOCKET_URL = "ws://localhost:8080/ws";
const CONNECTION_STATUSES = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated"
};
const FIXED_DEPOSIT = 10;

const BankAccount = () => {
  const { account_id } = useParams();
  const [balance, setBalance] = useState<number | null>(null);

  const [sendMessage, lastMessage, readyState, getWebSocket] = useWebSocket(
    `${SOCKET_URL}`
  );

  const connectionStatus = CONNECTION_STATUSES[readyState];

  useEffect(
    () => {
      if (lastMessage !== null) {
        // getWebSocket returns the WebSocket wrapped in a Proxy.
        // This is to restrict actions like mutating a shared websocket, overwriting handlers, etc
        const currentWebsocketUrl = getWebSocket().url;
        console.log("received a message from ", currentWebsocketUrl);
      }
    },
    [lastMessage]
  );

  useEffect(
    () => {
      async function fetchData() {
        const response = await fetch(
          `http://localhost:8080/account/${account_id}/balance`
        );
        const { balance } = await response.json(); // {"balance": 42}
        setBalance(balance);
      }
      fetchData();
    },
    [lastMessage]
  );

  // @ts-ignore
  async function handleDeposit() {
    const response = await fetch(
      `http://localhost:8080/account/${account_id}/deposit/${FIXED_DEPOSIT}`,
      {
        method: "POST"
      }
    );
    const { balance } = await response.json();
    setBalance(balance);
  }

  return (
    <div>
      <h2>Account {account_id}</h2>
      <div>The WebSocket is currently {connectionStatus}</div>
      {lastMessage ? <div>Last message: {lastMessage.data}</div> : null}
      <div>Your balance is {balance === null ? "unknown" : balance}</div>
      <button onClick={handleDeposit}>deposit $10</button>
    </div>
  );
};

export default BankAccount;
