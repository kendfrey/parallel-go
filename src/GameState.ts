import { Schema, type } from "@colyseus/schema";

export class GameState extends Schema
{
	@type("string")
	state: string = "initial state";
}