import { Room, Client } from "colyseus";
import Board, { Sign, Vertex } from "@sabaki/go-board";
import { GameState } from "./GameState";

const opts = { preventSuicide: true, preventOverwrite: true };

export class GameRoom extends Room<GameState>
{
	private board: Board = Board.fromDimensions(19);

	onCreate(options: any)
	{
		this.setState(new GameState());
		this.onMessage("sit", (c, m) => this.onSit(c, m));
		this.onMessage("stand", (c, m) => this.onStand(c, m));
		this.onMessage("click", (c, m) => this.onClick(c, m));
		this.onMessage("pass", c => this.onPass(c));

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
		let player: "black" | "white";
		if (client.sessionId === this.state.black.player)
			player = "black";
		else if (client.sessionId === this.state.white.player)
			player = "white";
		else
			return;

		try
		{
			if (this.state[player].bannedMoves.includes(position))
				throw new Error();

			this.board.makeMove(player === "black" ? 1 : -1, this.toVertex(position), opts);
			this.state[player].proposedMove = position;
		}
		catch
		{
			this.state[player].proposedMove = undefined;
		}
		this.attemptMove();
		this.updateBoardState();
	}

	onPass(client: Client)
	{
		let player: "black" | "white";
		if (client.sessionId === this.state.black.player)
			player = "black";
		else if (client.sessionId === this.state.white.player)
			player = "white";
		else
			return;

		this.state[player].proposedMove = -1;
		this.attemptMove();
		this.updateBoardState();
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

	attemptMove()
	{
		if (this.state.black.proposedMove === undefined || this.state.white.proposedMove === undefined)
			return;

		try
		{
			const bwBoard = this.board.makeMove(1, this.toVertex(this.state.black.proposedMove), opts).makeMove(-1, this.toVertex(this.state.white.proposedMove), opts);
			const wbBoard = this.board.makeMove(-1, this.toVertex(this.state.white.proposedMove), opts).makeMove(1, this.toVertex(this.state.black.proposedMove), opts);
			const diff = bwBoard.diff(wbBoard);

			if (diff !== null && diff.length === 0)
			{
				this.board = bwBoard;
				this.state.black.lastMove = this.state.black.proposedMove;
				this.state.white.lastMove = this.state.white.proposedMove;
				this.state.black.bannedMoves.clear();
				this.state.white.bannedMoves.clear();
			}
			else
			{
				throw new Error();
			}
		}
		catch (e)
		{
			this.state.black.bannedMoves.push(this.state.black.proposedMove);
			this.state.white.bannedMoves.push(this.state.white.proposedMove);
		}
		this.state.black.proposedMove = undefined;
		this.state.white.proposedMove = undefined;
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