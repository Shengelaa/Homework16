import { Request, Response, NextFunction } from "express";

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userRole = req.headers["role"];
  if (userRole !== "admin") {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  next();
};
