import express, { Express, Request, Response } from "express";
const app: Express = express();
const PORT = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
