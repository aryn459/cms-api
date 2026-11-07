import "reflect-metadata";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

import { plainToInstance } from "class-transformer";
import { IsEmail, validate } from "class-validator";

import { prisma } from "./config/database";
import { env } from "./config/environment";

const app = express();

app.use(express.json());

// DTO for validation test
class TestDto {
  @IsEmail()
  email!: string;
}

// Multer setup
const upload = multer({
  storage: multer.memoryStorage()
});

// ======================================
// PACKAGE TEST ROUTE
// ======================================

if (env.nodeEnv === "development") {

  app.get("/api/dev/test-packages", async (req, res) => {

    const results: Record<string, boolean> = {};

    // 1. Reflect Metadata
    try {
      const target = {};
      Reflect.defineMetadata("test", "working", target);

      results.reflectMetadata =
        Reflect.getMetadata("test", target) === "working";
    } catch {
      results.reflectMetadata = false;
    }

    // 2. Bcrypt
    try {
      const hash = await bcrypt.hash("test123", 10);

      results.bcrypt =
        await bcrypt.compare("test123", hash);
    } catch {
      results.bcrypt = false;
    }

    // 3. JWT
    try {
      const token = jwt.sign(
        { id: 1 },
        env.jwtSecret,
        { expiresIn: "5m" }
      );

      const decoded = jwt.verify(
        token,
        env.jwtSecret
      ) as jwt.JwtPayload;

      results.jwt = decoded.id === 1;
    } catch {
      results.jwt = false;
    }

    // 4. Class Transformer
    try {
      const dto = plainToInstance(TestDto, {
        email: "test@example.com"
      });

      results.classTransformer = dto instanceof TestDto;
    } catch {
      results.classTransformer = false;
    }

    // 5. Class Validator
    try {
      const dto = plainToInstance(TestDto, {
        email: "test@example.com"
      });

      const errors = await validate(dto);

      results.classValidator = errors.length === 0;
    } catch {
      results.classValidator = false;
    }

    // 6. Multer
    try {
      results.multer =
        typeof upload.single === "function";
    } catch {
      results.multer = false;
    }

    // 7. PRISMA + POSTGRESQL
    try {
      // Test database write
      const record = await prisma.smokeCheck.create({
        data: {}
      });

      console.log("Prisma record created:", record);

      // Test database read
      const records = await prisma.smokeCheck.findMany();

      console.log("Prisma records retrieved:", records);

      results.prisma = true;
      results.postgresql = true;

    } catch (error) {
      console.error("Database test failed:", error);

      results.prisma = false;
      results.postgresql = false;
    }

    const allWorking = Object.values(results).every(
      result => result === true
    );

    res.status(allWorking ? 200 : 500).json({
      success: allWorking,
      message: allWorking
        ? "All packages are working successfully!"
        : "Some packages failed. Check the results.",
      results
    });

  });

}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CMS API is running",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

export default app;
