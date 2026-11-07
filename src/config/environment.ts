import "dotenv/config";

const num = (v: string | undefined, d: number) => v ? Number(v) : d;

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: num(process.env.PORT, 3000),
    dbUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET||"development-secret-change-me",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN||"1h",
    uploadDir: process.env.UPLOAD_DIR||"uploads",
    maxUploadSize: num(process.env.MAX_UPLOAD_SIZE,5*1024*1024)
};

if(!Number.isFinite(env.port)||env.port<1){
    throw new Error("PORT must be a positive number");
}