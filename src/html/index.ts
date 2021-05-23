const joinContainer = document.getElementById("join") as HTMLDivElement;
const nickInput = document.getElementById("nick") as HTMLInputElement;
const gameIdInput = document.getElementById("game-id") as HTMLInputElement;
const newGameBtn = document.getElementById("new-game") as HTMLButtonElement;
const joinGameBtn = document.getElementById("join-game") as HTMLButtonElement;
const gameContainer = document.getElementById("game") as HTMLDivElement;
const currentGameId = document.getElementById("current-game-id") as HTMLSpanElement;
const blackPlayer = document.getElementById("black-player") as HTMLSpanElement;
const sitBlackBtn = document.getElementById("sit-black") as HTMLButtonElement;
const standBlackBtn = document.getElementById("stand-black") as HTMLButtonElement;
const whitePlayer = document.getElementById("white-player") as HTMLSpanElement;
const sitWhiteBtn = document.getElementById("sit-white") as HTMLButtonElement;
const standWhiteBtn = document.getElementById("stand-white") as HTMLButtonElement;
const gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;

newGameBtn.addEventListener("click", onNew);
joinGameBtn.addEventListener("click", onJoin);
sitBlackBtn.addEventListener("click", () => onSitStand("sit", "black"));
standBlackBtn.addEventListener("click", () => onSitStand("stand", "black"));
sitWhiteBtn.addEventListener("click", () => onSitStand("sit", "white"));
standWhiteBtn.addEventListener("click", () => onSitStand("stand", "white"));
gameCanvas.addEventListener("click", onClick);

const client = new Colyseus.Client();

let room : Colyseus.Room | undefined = undefined;

async function onJoin()
{
	room = await client.joinById(gameIdInput.value, { nick: nickInput.value });
	setupRoom(room);
}

async function onNew()
{
	room = await client.create("game", { nick: nickInput.value });
	setupRoom(room);
}

function onClick(e: MouseEvent)
{
	if (room === undefined)
		return;

	room.send("click", fromVertex(Math.floor(e.offsetX / stoneSize), Math.floor(e.offsetY / stoneSize)));
}

function setupRoom(room: Colyseus.Room)
{
	room.onStateChange(update);
	room.onLeave(onLeave)
}

function onSitStand(command: string, player: string)
{
	if (room === undefined)
		return;

	room.send(command, player);
}

function onLeave()
{
	room = undefined;
	update();
}

function update()
{
	joinContainer.style.display = room === undefined ? "" : "none";
	gameContainer.style.display = room !== undefined ? "" : "none";

	if (room === undefined)
		return;

	currentGameId.textContent = room.id;

	blackPlayer.textContent = room.state.black.nick;
	sitBlackBtn.style.display = room.state.black.player === undefined ? "" : "none";
	standBlackBtn.style.display = room.state.black.player === room.sessionId ? "" : "none";
	whitePlayer.textContent = room.state.white.nick;
	sitWhiteBtn.style.display = room.state.white.player === undefined ? "" : "none";
	standWhiteBtn.style.display = room.state.white.player === room.sessionId ? "" : "none";

	drawBoard();
}

const ctx = gameCanvas.getContext("2d") as CanvasRenderingContext2D;
const size = 19;
const stoneSize = 45;
const stoneOffset = stoneSize * 0.5;

function drawBoard()
{
	if (room === undefined)
		return;

	ctx.lineWidth = 1;

	// fill background
	gameCanvas.width = size * stoneSize;
	gameCanvas.height = size * stoneSize;
	ctx.fillStyle = "#ffdf7f";
	ctx.fillRect(0, 0, size * stoneSize, size * stoneSize);

	// draw lines
	ctx.strokeStyle = "black";
	ctx.beginPath();
	for (let x = 0; x < size; x++)
	{
		ctx.moveTo(x * stoneSize + stoneOffset, stoneOffset - 0.5);
		ctx.lineTo(x * stoneSize + stoneOffset, (size - 1) * stoneSize + stoneOffset + 0.5);
	}
	for (let y = 0; y < size; y++)
	{
		ctx.moveTo(stoneOffset - 0.5, y * stoneSize + stoneOffset);
		ctx.lineTo((size - 1) * stoneSize + stoneOffset + 0.5, y * stoneSize + stoneOffset);
	}
	ctx.stroke();

	// draw star points
	ctx.fillStyle = "black";
	for (let x = 3; x < size; x += 6)
	{
		for (let y = 3; y < size; y += 6)
		{
			ctx.beginPath();
			ctx.ellipse(x * stoneSize + stoneOffset, y * stoneSize + stoneOffset, 3, 3, 0, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	// draw stones
	for (const position of room.state.black.stones)
	{
		drawStone("#000000", position);
	}
	for (const position of room.state.white.stones)
	{
		drawStone("#ffffff", position);
	}
	if (room.state.black.proposedMove !== undefined)
	{
		drawStone("#0000007f", room.state.black.proposedMove);
	}
	if (room.state.white.proposedMove !== undefined)
	{
		drawStone("#ffffff7f", room.state.white.proposedMove);
	}
	if (room.state.black.lastMove !== undefined)
	{
		drawMoveMarker("#ffffff", room.state.black.lastMove);
	}
	if (room.state.white.lastMove !== undefined)
	{
		drawMoveMarker("#000000", room.state.white.lastMove);
	}
}

function drawStone(colour: string, position: number)
{
	const [x, y] = toVertex(position);
	ctx.strokeStyle = "black";
	ctx.fillStyle = colour;
	ctx.beginPath();
	ctx.ellipse(x * stoneSize + stoneOffset, y * stoneSize + stoneOffset, stoneOffset - 0.5, stoneOffset - 0.5, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
}

function drawMoveMarker(colour: string, position: number)
{
	const [x, y] = toVertex(position);
	ctx.strokeStyle = colour;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(x * stoneSize + stoneOffset, y * stoneSize + stoneOffset, stoneOffset * 0.5, stoneOffset * 0.5, 0, 0, Math.PI * 2);
	ctx.stroke();
}

function toVertex(position: number): [number, number]
{
	return [position % size, Math.floor(position / size)];
}

function fromVertex(x: number, y: number)
{
	return y * size + x;
}