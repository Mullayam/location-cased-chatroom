async function io(server){
   io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }})
  retur
}