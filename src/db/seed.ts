import { db } from './index';
import { users, pitches } from './schema';
import { initialPitches } from '@/data/static/pitches';

/**
 * Seed the database with initial data
 * This script creates dummy users and inserts all pitches from static data
 */
async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create dummy users for each pitch
    console.log('👥 Creating users...');
    const userMap = new Map<string, string>();

    for (const pitch of initialPitches) {
      const userId = `user_${pitch.id}`;
      const userEmail = `user${pitch.id}@${pitch.title.toLowerCase().replace(/\s+/g, '')}.com`;

      // Create user if not already created
      if (!userMap.has(pitch.id)) {
        await db
          .insert(users)
          .values({
            id: userId,
            email: userEmail,
            walletAddress: `0x${pitch.id.padStart(40, '0')}`,
            name: `${pitch.title} Founder`,
            userType: 'startup',
          })
          .onConflictDoNothing();

        userMap.set(pitch.id, userId);
        console.log(`  ✓ Created user for pitch: ${pitch.title}`);
      }
    }

    console.log(`✅ Created ${userMap.size} users`);

    // Insert pitches
    console.log('\n📋 Inserting pitches...');

    for (const pitch of initialPitches) {
      const userId = userMap.get(pitch.id)!;

      await db
        .insert(pitches)
        .values({
          id: pitch.id,
          userId: userId,
          title: pitch.title,
          summary: pitch.summary,
          elevatorPitch: pitch.elevatorPitch,
          status: pitch.status,
          dateSubmitted: new Date(pitch.dateSubmitted),
          submissionId: pitch.submissionId,
          reviewTimeline: pitch.reviewTimeline,
          lastUpdated: pitch.lastUpdated
            ? new Date(pitch.lastUpdated)
            : new Date(),
          reviewNotes: pitch.reviewNotes,
          industry: pitch.industry,
          companyStage: pitch.companyStage,
          teamSize: pitch.teamSize,
          location: pitch.location,
          website: pitch.website,
          oneKeyMetric: pitch.oneKeyMetric,
          fundingGoal: pitch.fundingGoal,
          customAmount: pitch.customAmount,
          productDevelopment: pitch.productDevelopment,
          marketingSales: pitch.marketingSales,
          teamExpansion: pitch.teamExpansion,
          operations: pitch.operations,
          timeToRaise: pitch.timeToRaise,
          expectedROI: pitch.expectedROI,
          pitchDeckUrl: pitch.pitchDeckUrl,
          pitchVideoUrl: pitch.pitchVideoUrl,
          demoUrl: pitch.demoUrl,
          prototypeUrl: pitch.prototypeUrl,
          imageUrl: pitch.imageUrl,
          featured: pitch.featured || false,
          featuredImage: pitch.featuredImage,
        })
        .onConflictDoNothing();

      console.log(`  ✓ Inserted pitch: ${pitch.title}`);
    }

    console.log(`\n✅ Successfully seeded ${initialPitches.length} pitches!`);
    console.log('\n🎉 Database seed completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('\n✨ Seed script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
