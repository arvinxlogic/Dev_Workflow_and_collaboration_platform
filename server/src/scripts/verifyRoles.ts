import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

async function verifyRoles() {
  console.log("🔍 Verifying user roles...\n");

  const users = await prisma.user.findMany({
    select: {
      username: true,
      role: true,
      isActive: true,
      cognitoId: true,
    },
  });

  console.log("📊 Users by Role:\n");
  
  const roleGroups = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user.username);
    return acc;
  }, {} as Record<string, string[]>);

  Object.entries(roleGroups).forEach(([role, usernames]) => {
    console.log(`${role}:`);
    usernames.forEach(name => console.log(`  - ${name}`));
    console.log();
  });

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  console.log(`✅ Total Admins: ${adminCount}`);
  
  await prisma.$disconnect();
}

verifyRoles().catch((e) => {
  console.error(e);
  process.exit(1);
});
