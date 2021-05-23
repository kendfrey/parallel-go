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

	@type({ array: "uint16" })
	blackStones = new ArraySchema<number>();

	@type({ array: "uint16" })
	whiteStones = new ArraySchema<number>();
}