import http from "http";
import express from "express";
import { Server } from "colyseus";

const app = express();
app.use(express.static("html"));
app.use(express.json());

const gameServer = new Server({ server: http.createServer(app) });
gameServer.listen(8000);