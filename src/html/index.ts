main();

async function main()
{
	const client = new Colyseus.Client();
	const room = await client.create("game", { nick: "nick" });
	room.onMessage("greeting", msg => console.log(msg));
}