import { db } from "./index";
import { pitches, pools, poolStartups, users } from "./schema";
import { initialPitches } from "@/data/static/pitches";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Seed the database with initial data
 * This script creates dummy users and inserts all pitches from static data
 */
async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create admin user
    console.log("👤 Creating admin user...");
    await db
      .insert(users)
      .values({
        id: "user_1",
        email: "admin@crowdvc.com",
        walletAddress: "0xADMIN000000000000000000000000000000000",
        name: "Admin User",
        userType: "admin",
      })
      .onConflictDoNothing();
    console.log("  ✓ Created admin user");

    // Create investor users
    console.log("\n👥 Creating investor users...");
    for (let i = 2; i <= 5; i++) {
      await db
        .insert(users)
        .values({
          id: `user_${i}`,
          email: `investor${i}@example.com`,
          walletAddress: `0xINVESTOR${String(i).padStart(32, "0")}`,
          name: `Investor ${i}`,
          userType: "investor",
        })
        .onConflictDoNothing();
      console.log(`  ✓ Created investor user ${i}`);
    }

    // Create dummy users for each pitch
    console.log("\n👥 Creating startup users...");
    const userMap = new Map<string, string>();

    for (const pitch of initialPitches) {
      const userId = `user_${pitch.id}`;
      const userEmail = `user${pitch.id}@${
        pitch.title.toLowerCase().replace(/\s+/g, "")
      }.com`;

      // Create user if not already created
      if (!userMap.has(pitch.id)) {
        await db
          .insert(users)
          .values({
            id: userId,
            email: userEmail,
            walletAddress: `0x${pitch.id.padStart(40, "0")}`,
            name: `${pitch.title} Founder`,
            userType: "startup",
          })
          .onConflictDoNothing();

        userMap.set(pitch.id, userId);
        console.log(`  ✓ Created user for pitch: ${pitch.title}`);
      }
    }

    console.log(`✅ Created ${userMap.size} startup users`);

    // Insert pitches
    console.log("\n📋 Inserting pitches...");

    for (const pitch of initialPitches) {
      const userId = userMap.get(pitch.id);
      if (!userId) continue;

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

    // Create investment pools
    console.log("\n💰 Creating investment pools...");

    const poolsData = [
      {
        id: uuidv4(),
        name: "Q1 2025 FinTech Innovation Pool",
        description:
          "Supporting innovative financial technology startups disrupting traditional banking, payments, and investment management.",
        category: "FinTech",
        votingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "active" as const,
      },
      {
        id: uuidv4(),
        name: "HealthTech & Medical Innovation Pool",
        description:
          "Investing in cutting-edge healthcare technology, telemedicine, and medical device innovations improving patient outcomes.",
        category: "HealthTech",
        votingDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: "active" as const,
      },
      {
        id: uuidv4(),
        name: "EdTech & Future of Learning Pool",
        description:
          "Empowering educational technology startups transforming how people learn, teach, and develop skills.",
        category: "EdTech",
        votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: "upcoming" as const,
      },
    ];

    for (const poolData of poolsData) {
      await db.insert(pools).values(poolData).onConflictDoNothing();
      console.log(`  ✓ Created pool: ${poolData.name}`);
    }

    console.log(`✅ Created ${poolsData.length} investment pools`);

    // Assign approved startups to pools based on industry
    console.log("\n🔗 Assigning startups to pools...");

    const approvedPitches = initialPitches.filter((p) =>
      p.status === "approved"
    );

    for (const poolData of poolsData) {
      // Find pitches matching the pool category
      const matchingPitches = approvedPitches.filter((pitch) => {
        const industry = pitch.industry.toLowerCase();
        const category = poolData.category.toLowerCase();

        // Match based on category keywords
        if (category.includes("fintech")) {
          return industry.includes("finance") || industry.includes("fintech") ||
            industry.includes("payment");
        }
        if (category.includes("health")) {
          return industry.includes("health") || industry.includes("medical") ||
            industry.includes("biotech");
        }
        if (category.includes("edtech")) {
          return industry.includes("education") ||
            industry.includes("edtech") || industry.includes("learning");
        }
        return false;
      });

      // Assign up to 5 startups per pool
      const startupsToAssign = matchingPitches.slice(0, 5);

      for (const pitch of startupsToAssign) {
        await db
          .insert(poolStartups)
          .values({
            poolId: poolData.id,
            pitchId: pitch.id,
          })
          .onConflictDoNothing();

        // Update pitch status to 'in-pool'
        await db
          .update(pitches)
          .set({ status: "in-pool", lastUpdated: new Date() })
          .where(eq(pitches.id, pitch.id));

        console.log(`  ✓ Assigned ${pitch.title} to ${poolData.name}`);
      }
    }

    console.log("\n🎉 Database seed completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("\n✨ Seed script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed script failed:", error);
    process.exit(1);
  });
