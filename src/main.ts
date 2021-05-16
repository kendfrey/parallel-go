import http from "http";
import express from "express";
import { Server } from "colyseus";
import { GameRoom } from "./GameRoom";

const app = express();
app.use(express.static("html"));
app.use(express.json());

const gameServer = new Server({ server: http.createServer(app) });

gameServer.define("game", GameRoom);

gameServer.listen(8000);