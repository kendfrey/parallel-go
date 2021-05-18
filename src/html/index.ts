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

newGameBtn.addEventListener("click", onNew);
joinGameBtn.addEventListener("click", onJoin);
sitBlackBtn.addEventListener("click", () => onSitStand("sit", "black"));
standBlackBtn.addEventListener("click", () => onSitStand("stand", "black"));
sitWhiteBtn.addEventListener("click", () => onSitStand("sit", "white"));
standWhiteBtn.addEventListener("click", () => onSitStand("stand", "white"));

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

function setupRoom(room: Colyseus.Room)
{
	room.onStateChange(update);
	room.onLeave(leave)
}

function onSitStand(command: string, player: string)
{
	if (room === undefined)
		return;

	room.send(command, player);
}

function leave()
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

	blackPlayer.textContent = room.state.blackPlayerNick;
	sitBlackBtn.style.display = room.state.blackPlayer === undefined ? "" : "none";
	standBlackBtn.style.display = room.state.blackPlayer === room.sessionId ? "" : "none";
	whitePlayer.textContent = room.state.whitePlayerNick;
	sitWhiteBtn.style.display = room.state.whitePlayer === undefined ? "" : "none";
	standWhiteBtn.style.display = room.state.whitePlayer === room.sessionId ? "" : "none";
}