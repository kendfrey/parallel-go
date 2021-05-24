import { Client } from "colyseus";
import { Schema, SetSchema, type, filter } from "@colyseus/schema";

export class PlayerState extends Schema
{
	@type("string")
	player?: string;

	@type("string")
	nick?: string;

	@type({ set: "int16" })
	stones = new SetSchema<number>();

	@filter(filterPlayer)
	@type("int16")
	proposedMove?: number;
	
	@type("int16")
	lastMove?: number;

	@type({ set: "int16" })
	bannedMoves = new SetSchema<number>();

	@type({ set: "int16" })
	territory = new SetSchema<number>();
}

export class GameState extends Schema
{
	@type(PlayerState)
	black = new PlayerState();

	@type(PlayerState)
	white = new PlayerState();
}

function filterPlayer(this: PlayerState, client: Client, value: any, root: any): boolean
{
	return this.player === client.sessionId;
}