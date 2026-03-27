import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@yieldmaster.ai" },
    update: {},
    create: {
      email: "demo@yieldmaster.ai",
      password: hash,
      name: "Demo User",
      location: "Hyderabad, Telangana, India",
      plan: "pro",
    },
  });
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  console.log("Seeded demo user: demo@yieldmaster.ai / demo1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
