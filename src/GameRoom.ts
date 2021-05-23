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
			if (this.state.blackPlayer === undefined)
			{
				this.state.blackPlayer = client.id;
				this.state.blackPlayerNick = client.userData.nick;
			}
		}
		else if (message === "white")
		{
			if (this.state.whitePlayer === undefined)
			{
				this.state.whitePlayer = client.id;
				this.state.whitePlayerNick = client.userData.nick;
			}
		}
	}

	onStand(client: Client, message: string)
	{
		if (message === "black")
		{
			if (this.state.blackPlayer === client.sessionId)
			{
				this.state.blackPlayer = undefined;
				this.state.blackPlayerNick = undefined;
			}
		}
		else if (message === "white")
		{
			if (this.state.whitePlayer === client.sessionId)
			{
				this.state.whitePlayer = undefined;
				this.state.whitePlayerNick = undefined;
			}
		}
	}

	onClick(client: Client, position: number)
	{
		let player: Sign;
		if (client.sessionId === this.state.blackPlayer)
			player = 1;
		else if (client.sessionId === this.state.whitePlayer)
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
		this.state.blackStones.clear();
		this.state.whiteStones.clear();

		for (let i = 0; i < this.board.width * this.board.height; i++)
		{
			const stone = this.board.get(this.toVertex(i));
			if (stone === 1)
				this.state.blackStones.push(i);
			else if (stone === -1)
				this.state.whiteStones.push(i);
		}
	}

	toVertex(position: number): Vertex
	{
		return [position % this.board.width, Math.floor(position / this.board.width)];
	}
}