import { UserService } from '../services/user.service';
import { config } from '../config/constants';

const userService = new UserService();

/**
 * Creating test users
 */
async function seedUsers(): Promise<void> {
  console.log('Seeding users...');

  const testUsers = [
    {
      name: 'Test User',
      email: 'test@example.com',
      login: 'testuser',
      phone: '+375291234567',
      password: 'password123',
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      login: 'admin',
      phone: '+375297654321',
      password: 'admin123',
    },
  ];

  for (const userData of testUsers) {
    try {
      const existing = await userService.findByEmailOrLogin(userData.email, userData.login);
      if (!existing) {
        await userService.createUser(userData);
        console.log(`Created user: ${userData.login}`);
      } else {
        console.log(`User already exists: ${userData.login}`);
      }
    } catch (error) {
      console.error(`Failed to create user ${userData.login}:`, error);
    }
  }
}

/**
 * Main seed function
 */
async function seed(): Promise<void> {
  console.log('Starting seed process...');
  console.log(`Environment: ${config.nodeEnv}`);

  await seedUsers();

  console.log('Seed completed!');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
