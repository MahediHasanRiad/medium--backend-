import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../shared/http/apiError";

export function errorMiddleware(
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
) {
  const context = {
    level: "error",
    method: request.method,
    path: request.path,
    statusCode: error instanceof ApiError ? error.statusCode : 500,
    message: error instanceof Error ? error.message : "Unknown error",
  };
  console.error(JSON.stringify(context));

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Invalid request",
      errors: error.flatten(),
    });
    return;
  }

  response.status(500).json({ success: false, message: "Internal server error" });
}
