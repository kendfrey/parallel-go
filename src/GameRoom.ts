import { Room, Client } from "colyseus";
import Board, { Sign, Vertex } from "@sabaki/go-board";
import { GameState } from "./GameState";

const opts = { preventSuicide: true, preventOverwrite: true };

export class GameRoom extends Room<GameState>
{
	private board: Board = Board.fromDimensions(19);
	private countingBoard?: Board;

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
			
		if (this.countingBoard !== undefined)
		{
			const vertex = this.toVertex(position);
			const colour = this.board.get(vertex)!;
			for (const v of this.board.getRelatedChains(vertex))
			{
				if (this.countingBoard.get(v) === colour)
					this.countingBoard.set(v, 0);
				else
					this.countingBoard.set(v, colour);
			}
		}
		else
		{
			try
			{
				if (this.state[player].bannedMoves.has(position))
					throw new Error();

				this.board.makeMove(player === "black" ? 1 : -1, this.toVertex(position), opts);
				this.state[player].proposedMove = position;
			}
			catch
			{
				this.state[player].proposedMove = undefined;
			}
			this.attemptMove();
		}
		this.updateBoardState();
	}

	onPass(client: Client)
	{
		if (this.countingBoard !== undefined)
			return;

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
			this.state.black.bannedMoves.add(this.state.black.proposedMove);
			this.state.white.bannedMoves.add(this.state.white.proposedMove);
		}

		if (this.state.black.proposedMove === -1 && this.state.white.proposedMove === -1)
			this.countingBoard = this.board.clone();

		this.state.black.proposedMove = undefined;
		this.state.white.proposedMove = undefined;
	}

	updateBoardState()
	{
		this.state.black.stones.clear();
		this.state.white.stones.clear();
		this.state.black.territory.clear();
		this.state.white.territory.clear();

		for (let i = 0; i < this.board.width * this.board.height; i++)
		{
			const vertex = this.toVertex(i);
			const stone = this.board.get(vertex);
			if (stone === 1)
				this.state.black.stones.add(i);
			else if (stone === -1)
				this.state.white.stones.add(i);

			if (this.countingBoard !== undefined)
			{
				var countingStone = this.countingBoard.get(vertex);
				if (countingStone === 1 && !this.state.black.territory.has(i))
				{
					for (const v of this.countingBoard.getConnectedComponent(vertex, v => this.countingBoard!.get(v) !== -1))
						this.state.black.territory.add(this.fromVertex(v));
				}
				else if (countingStone === -1 && !this.state.white.territory.has(i))
				{
					for (const v of this.countingBoard.getConnectedComponent(vertex, v => this.countingBoard!.get(v) !== 1))
						this.state.white.territory.add(this.fromVertex(v));
				}

				for (const neutral of this.state.black.territory.values())
				{
					if (this.state.white.territory.has(neutral))
					{
						this.state.black.territory.delete(neutral);
						this.state.white.territory.delete(neutral);
					}
				}
			}
		}
	}

	toVertex(position: number): Vertex
	{
		return [position % this.board.width, Math.floor(position / this.board.width)];
	}

	fromVertex([x, y]: Vertex): number
	{
		return y * this.board.width + x;
	}
}