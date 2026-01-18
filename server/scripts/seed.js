import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

/**
 * Seed script to populate database with demo users
 * Run with: npm run seed
 */

const seedUsers = [
    {
        username: 'alice_demo',
        email: 'alice@demo.com',
        password: 'password123',
        balance: 5000,
    },
    {
        username: 'bob_demo',
        email: 'bob@demo.com',
        password: 'password123',
        balance: 3000,
    },
    {
        username: 'charlie_demo',
        email: 'charlie@demo.com',
        password: 'password123',
        balance: 7500,
    },
    {
        username: 'diana_demo',
        email: 'diana@demo.com',
        password: 'password123',
        balance: 2000,
    },
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...\n');

        // Connect to database
        await connectDB();

        // Clear existing users (optional - comment out to preserve existing data)
        const deleteCount = await User.countDocuments();
        if (deleteCount > 0) {
            console.log(`⚠️  Found ${deleteCount} existing users`);
            const readline = await import('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            await new Promise((resolve) => {
                rl.question('Do you want to delete existing users? (yes/no): ', (answer) => {
                    if (answer.toLowerCase() === 'yes') {
                        User.deleteMany({}).then(() => {
                            console.log('✅ Cleared existing users\n');
                        });
                    } else {
                        console.log('⏭️  Skipping deletion\n');
                    }
                    rl.close();
                    resolve();
                });
            });
        }

        // Create demo users
        console.log('Creating demo users...\n');

        for (const userData of seedUsers) {
            try {
                const existingUser = await User.findOne({
                    $or: [{ email: userData.email }, { username: userData.username }]
                });

                if (existingUser) {
                    console.log(`⏭️  User ${userData.username} already exists`);
                    continue;
                }

                const user = await User.create(userData);
                console.log(`✅ Created user: ${user.username} (${user.email}) - Balance: $${user.balance}`);
            } catch (error) {
                console.error(`❌ Failed to create ${userData.username}:`, error.message);
            }
        }

        console.log('\n✅ Database seeding completed!');
        console.log('\n📝 Demo Account Credentials:');
        console.log('   Email: alice@demo.com | Password: password123');
        console.log('   Email: bob@demo.com | Password: password123');
        console.log('   Email: charlie@demo.com | Password: password123');
        console.log('   Email: diana@demo.com | Password: password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();
