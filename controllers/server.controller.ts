import { Request, Response } from "express";
import { config } from "../config/common";

const ServerController = {
  server,
};

export default ServerController;

function server(_req: Request, res: Response) {
  res.send({
    status: res.statusCode,
    message: config.MSG.WELCOME,
    timestamp: new Date().toISOString(),
  });
}
