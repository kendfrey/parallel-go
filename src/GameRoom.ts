import { Room, Client } from "colyseus";
import { GameState } from "./GameState";

export class GameRoom extends Room<GameState>
{
	onCreate(options: any)
	{
		this.setState(new GameState());
		this.onMessage("setstate", (client, message) => this.state.state = message);
	}

	onJoin(client: Client, options: any, auth: any)
	{
		
	}

	onLeave(client: Client, consented: boolean)
	{
		
	}
}