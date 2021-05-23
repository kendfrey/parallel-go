import { Room, Client } from "colyseus";
import { ArraySchema } from "@colyseus/schema";
import Board, { Vertex } from "@sabaki/go-board";
import { GameState } from "./GameState";

export class GameRoom extends Room<GameState>
{
	private board: Board = Board.fromDimensions(19);

	onCreate(options: any)
	{
		this.setState(new GameState());
		this.onMessage("sit", (c, m) => this.onSit(c, m));
		this.onMessage("stand", (c, m) => this.onStand(c, m));

		this.board = this.board.makeMove(1, [15, 3]);
		this.board = this.board.makeMove(-1, [3, 3]);
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