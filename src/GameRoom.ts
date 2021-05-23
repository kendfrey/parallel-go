import { Room, Client } from "colyseus";
import Board, { Sign, Vertex } from "@sabaki/go-board";
import { GameState } from "./GameState";

export class GameRoom extends Room<GameState>
{
	private board: Board = Board.fromDimensions(19);

	onCreate(options: any)
	{
		this.setState(new GameState());
		this.onMessage("sit", (c, m) => this.onSit(c, m));
		this.onMessage("stand", (c, m) => this.onStand(c, m));
		this.onMessage("click", (c, m) => this.onClick(c, m));

		this.updateBoardState();
	}

	onSit(client: Client, message: string)
	{
		if (message === "black")
		{
			if (this.state.black.player === undefined)
			{
				this.state.black.player = client.id;
				this.state.black.nick = client.userData.nick;
			}
		}
		else if (message === "white")
		{
			if (this.state.white.player === undefined)
			{
				this.state.white.player = client.id;
				this.state.white.nick = client.userData.nick;
			}
		}
	}

	onStand(client: Client, message: string)
	{
		if (message === "black")
		{
			if (this.state.black.player === client.sessionId)
			{
				this.state.black.player = undefined;
				this.state.black.nick = undefined;
			}
		}
		else if (message === "white")
		{
			if (this.state.white.player === client.sessionId)
			{
				this.state.white.player = undefined;
				this.state.white.nick = undefined;
			}
		}
	}

	onClick(client: Client, position: number)
	{
		let player: Sign;
		if (client.sessionId === this.state.black.player)
			player = 1;
		else if (client.sessionId === this.state.white.player)
			player = -1;
		else
			return;

		try
		{
			this.board = this.board.makeMove(player, this.toVertex(position), { preventSuicide: true, preventOverwrite: true });
			this.updateBoardState();
		}
		catch { }
	}

	onJoin(client: Client, options: any, auth: any)
	{
		client.userData = { nick: options.nick };
	}

	onLeave(client: Client, consented: boolean)
	{
		this.onStand(client, "black");
		this.onStand(client, "white");
	}

	updateBoardState()
	{
		this.state.black.stones.clear();
		this.state.white.stones.clear();

		for (let i = 0; i < this.board.width * this.board.height; i++)
		{
			const stone = this.board.get(this.toVertex(i));
			if (stone === 1)
				this.state.black.stones.push(i);
			else if (stone === -1)
				this.state.white.stones.push(i);
		}
	}

	toVertex(position: number): Vertex
	{
		return [position % this.board.width, Math.floor(position / this.board.width)];
	}
}