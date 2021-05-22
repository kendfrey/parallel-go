import { Schema, ArraySchema, type } from "@colyseus/schema";

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

	@type({ array: "int8" })
	board = new ArraySchema<number>();
}