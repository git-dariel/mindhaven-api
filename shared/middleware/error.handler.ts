import express from "express";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
};
