import { Schema, type } from "@colyseus/schema";

export class GameState extends Schema
{
	@type("string")
	blackPlayer?: string;

	@type("string")
	blackPlayerNick?: string;

	@type("string")
	whitePlayer?: string;

	@type("string")
	whitePlayerNick?: string;
}