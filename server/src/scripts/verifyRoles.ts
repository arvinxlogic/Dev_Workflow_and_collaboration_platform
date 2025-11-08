import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRoles() {
  console.log('🔍 Verifying user roles in database...\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    console.log(`📊 Found ${users.length} users:\n`);

    // Group by role
    const roleGroups = users.reduce((acc, user) => {
      const role = user.role || 'MEMBER'; // Default to MEMBER if null
      if (!acc[role]) acc[role] = [];
      acc[role].push(user.username);
      return acc;
    }, {} as Record<string, string[]>);

    // Display by role
    Object.entries(roleGroups).forEach(([role, usernames]) => {
      console.log(`  ${role}: ${usernames.join(', ')}`);
    });

    console.log('\n✅ Role verification complete!');
  } catch (error) {
    console.error('❌ Error verifying roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRoles();
