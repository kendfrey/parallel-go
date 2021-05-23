import { Schema, ArraySchema, type } from "@colyseus/schema";

export class PlayerState extends Schema
{
	@type("string")
	player?: string;

	@type("string")
	nick?: string;

	@type({ array: "uint16" })
	stones = new ArraySchema<number>();
}

export class GameState extends Schema
{
	@type(PlayerState)
	black = new PlayerState();

	@type(PlayerState)
	white = new PlayerState();
}