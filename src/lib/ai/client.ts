// 🤖 Groq Client Singleton
import Groq from "groq-sdk";

const globalForGroq = globalThis as unknown as {
  groqClient: Groq | undefined;
};

export const groqClient =
  globalForGroq.groqClient ??
  new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

if (process.env.NODE_ENV !== "production") {
  globalForGroq.groqClient = groqClient;
}
