import { Room, Client } from "colyseus";

export class GameRoom extends Room
{
	onCreate(options: any)
	{
		console.log("room created", this.roomId);
	}

	onJoin(client: Client, options: any, auth: any)
	{
		client.send("greeting", { text: "Hello, World!" });
		console.log("client joined", options.nick, client.id);
	}

	onLeave(client: Client, consented: boolean)
	{
		console.log("client left", client.id);
	}
}