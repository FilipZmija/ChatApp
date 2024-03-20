import jwt from "jsonwebtoken";
import { User } from "../database/models/User.model.js";
import { Response, NextFunction, Request } from "express";
import { CustomSocket } from "../types/local/socketIo.js";

export const createToken = (user: User): string => {
  const { name, id } = user;
  const accessToken = jwt.sign({ name, id }, process.env.SECRET_TOKEN);
  return accessToken;
};

export const validateTokenApi = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    jwt.verify(accessToken, process.env.SECRET_TOKEN, (err, decoded) => {
      if (err) {
        next(new Error("Invalid token"));
        res.status(401).json({ message: "Invalid token!" });
        return;
      }
      if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
        req.user = { id: decoded.id, name: decoded.name };
        next();
      }
    });
  } catch (e) {
    console.error(e);
    res.status(401).json(e);
    return;
  }
};

export const validateTokenSocket = (socket: CustomSocket, next: any) => {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    const accessToken: string = Array.isArray(socket.handshake.auth.token)
      ? socket.handshake.auth.token[0]
      : socket.handshake.auth.token;
    console.log(socket.handshake.auth.token);
    jwt.verify(accessToken, process.env.SECRET_TOKEN, (err, decoded) => {
      if (err) {
        next(new Error("Invalid token"));
        console.log(err);
        socket.emit("validation", "Invalid token!");
        return;
      }
      if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
        socket.user = { id: decoded.id, name: decoded.name };
        const data = {
          message: "User has been connected!",
          id: socket.id,
        };
        socket.emit("validation", data);
        next();
      }
    });
  }
};
