const nickInput = document.getElementById("nick") as HTMLInputElement;
const gameidInput = document.getElementById("gameid") as HTMLInputElement;
const newgameBtn = document.getElementById("newgame") as HTMLButtonElement;
const joingameBtn = document.getElementById("joingame") as HTMLButtonElement;
const gameContainer = document.getElementById("game") as HTMLDivElement;
const stateContainer = document.getElementById("state") as HTMLSpanElement;
const newstateInput = document.getElementById("newstate") as HTMLInputElement;
const setstateBtn = document.getElementById("setstate") as HTMLButtonElement;

newgameBtn.addEventListener("click", onNew);
joingameBtn.addEventListener("click", onJoin);
setstateBtn.addEventListener("click", onSetState);

const client = new Colyseus.Client();

let room : Colyseus.Room | undefined = undefined;

async function onJoin()
{
	room = await client.joinById(gameidInput.value, { nick: nickInput.value });
	room.onStateChange(update);
}

async function onNew()
{
	room = await client.create("game", { nick: nickInput.value });
	room.onStateChange(update);
}

function onSetState()
{
	if (room === undefined)
		return;

	room.send("setstate", newstateInput.value);
}

function update()
{
	if (room === undefined)
	{
		gameContainer.style.visibility = "collapse";
		return;
	}
	
	gameidInput.value = room.id;
	gameContainer.style.visibility = "visible";
	stateContainer.textContent = room.state.state;
}