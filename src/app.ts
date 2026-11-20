import "reflect-metadata";
import express from "express";
import type {
  Request,
  Response,
  NextFunction,
  RequestHandler
} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

import { plainToInstance } from "class-transformer";
import { IsEmail, validate } from "class-validator";

import { prisma } from "./config/database";
import { Prisma } from "@prisma/client";
import { env } from "./config/environment";

const app = express();

app.use(express.json());

app.get("/api/pages", async (req: Request, res: Response) => {
  try {
    const pages = await prisma.page.findMany();

    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pages" });
  }
});

app.get("/api/pages/:id", async (req: Request, res: Response) => {
  try {
    const page = await prisma.page.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch page" });
  }
});

app.post("/api/pages", async (req: Request, res: Response) => {
  try {
    const { title, slug, body } = req.body;

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        body,
      },
    });

    res.status(201).json(page);
  } catch (error) {
  console.error("Create page error:", error);

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      message: "Slug already exists",
    });
    return;
  }

  res.status(500).json({
    message: "Failed to create page",
  });
}
});

app.patch("/api/pages/:id", async (req: Request, res: Response) => {
  try {
    const { title, slug, body } = req.body;

    const page = await prisma.page.update({
      where: {
        id: req.params.id,
      },
      data: {
        title,
        slug,
        body,
      },
    });

    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ message: "Failed to update page" });
  }
});

app.delete("/api/pages/:id", async (req: Request, res: Response) => {
  try {
    await prisma.page.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete page" });
  }
});

export default app;