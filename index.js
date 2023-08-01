import app from "./server";

const PORT = 4000;
const database = "areahunt";

const mongoose = require("mongoose");

mongoose.connect(
  `mongodb+srv://als982001:${process.env.MONGODB_PASSWORD}@cluster0.cysggjr.mongodb.net/${database}?retryWrites=true&w=majority`,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);

const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => console.log("MongoDB 연결 성공"));

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
