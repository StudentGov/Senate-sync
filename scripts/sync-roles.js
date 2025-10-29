/**
 * Role Synchronization Script
 * Ensures Clerk and database roles are in sync.
 * 
 * Usage:
 *   npm run sync-roles           # Check for issues (dry-run)
 *   npm run sync-roles:fix       # Fix all issues
 *   npm run sync-roles:clerk     # Use Clerk as source of truth
 * 
 * See CURSOR_UPDATES.md for full documentation
 */

import { createClient } from "@libsql/client";
import { clerkClient } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";

// Load .env.local file
dotenv.config({ path: ".env.local" });

// Check required environment variables
if (!process.env.TURSO_DATABASE_URL) {
  console.error("\n❌ Missing TURSO_DATABASE_URL in .env.local file\n");
  console.log("Please add to your .env.local file:");
  console.log("TURSO_DATABASE_URL=your-database-url\n");
  process.exit(1);
}

if (!process.env.TURSO_AUTH_TOKEN) {
  console.error("\n❌ Missing TURSO_AUTH_TOKEN in .env.local file\n");
  console.log("Please add to your .env.local file:");
  console.log("TURSO_AUTH_TOKEN=your-auth-token\n");
  process.exit(1);
}

if (!process.env.CLERK_SECRET_KEY) {
  console.error("\n❌ Missing CLERK_SECRET_KEY in .env.local file\n");
  console.log("Please add to your .env.local file:");
  console.log("CLERK_SECRET_KEY=your-clerk-secret-key\n");
  process.exit(1);
}

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes("--fix");
const useClerkAsSource = args.includes("--clerk");
const sourceOfTruth = useClerkAsSource ? "Clerk" : "Database";

console.log("\n╔═══════════════════════════════════════════════════════════════╗");
console.log("║           ROLE SYNCHRONIZATION SCRIPT                        ║");
console.log("╚═══════════════════════════════════════════════════════════════╝\n");
console.log(`Mode: ${shouldFix ? "FIX" : "DRY-RUN (report only)"}`);
console.log(`Source of Truth: ${sourceOfTruth}\n`);

if (!shouldFix) {
  console.log("💡 Running in DRY-RUN mode. Use --fix to automatically fix issues.\n");
}

/**
 * Main sync function
 */
async function syncRoles() {
  const issues = {
    mismatches: [],
    dbOnly: [],
    clerkOnly: [],
    errors: []
  };

  let fixedCount = 0;

  try {
    console.log("📊 Step 1: Fetching all users from database...\n");
    
    // Fetch all users from database
    const dbResult = await turso.execute({
      sql: "SELECT id, username, role FROM Users",
      args: [],
    });
    const dbUsers = dbResult.rows;
    console.log(`   Found ${dbUsers.length} users in database\n`);

    console.log("📊 Step 2: Fetching all users from Clerk...\n");
    
    // Fetch all users from Clerk (with pagination)
    let clerkUsers = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await clerkClient.users.getUserList({
        limit,
        offset,
      });
      clerkUsers = clerkUsers.concat(response.data);
      offset += limit;
      hasMore = response.data.length === limit;
    }
    
    console.log(`   Found ${clerkUsers.length} users in Clerk\n`);

    // Create maps for quick lookup
    const dbUserMap = new Map();
    dbUsers.forEach(user => {
      dbUserMap.set(user.id, user);
    });

    const clerkUserMap = new Map();
    clerkUsers.forEach(user => {
      clerkUserMap.set(user.id, user);
    });

    console.log("🔍 Step 3: Checking for inconsistencies...\n");

    // Check each Clerk user
    for (const clerkUser of clerkUsers) {
      const userId = clerkUser.id;
      const clerkRole = clerkUser.publicMetadata?.role;
      const dbUser = dbUserMap.get(userId);

      if (!dbUser) {
        // User exists in Clerk but not in database
        issues.clerkOnly.push({
          userId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          clerkRole: clerkRole || "NOT SET",
        });
      } else {
        // User exists in both - check for role mismatch
        const dbRole = dbUser.role;
        
        if (clerkRole !== dbRole) {
          issues.mismatches.push({
            userId,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            username: dbUser.username,
            clerkRole: clerkRole || "NOT SET",
            dbRole: dbRole || "NOT SET",
          });
        }
      }
    }

    // Check for users in database but not in Clerk
    for (const dbUser of dbUsers) {
      if (!clerkUserMap.has(dbUser.id)) {
        issues.dbOnly.push({
          userId: dbUser.id,
          username: dbUser.username,
          dbRole: dbUser.role,
        });
      }
    }

    // Report findings
    console.log("═══════════════════════════════════════════════════════════════\n");
    console.log("📋 SYNC REPORT\n");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Report role mismatches
    if (issues.mismatches.length > 0) {
      console.log(`⚠️  ROLE MISMATCHES (${issues.mismatches.length}):\n`);
      issues.mismatches.forEach((issue, index) => {
        console.log(`   ${index + 1}. User: ${issue.email || issue.username}`);
        console.log(`      User ID: ${issue.userId}`);
        console.log(`      Clerk Role: ${issue.clerkRole}`);
        console.log(`      Database Role: ${issue.dbRole}`);
        console.log(`      → Will sync to: ${useClerkAsSource ? issue.clerkRole : issue.dbRole}\n`);
      });

      if (shouldFix) {
        console.log("   🔧 Fixing role mismatches...\n");
        for (const issue of issues.mismatches) {
          try {
            if (useClerkAsSource) {
              // Update database to match Clerk
              await turso.execute({
                sql: "UPDATE Users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                args: [issue.clerkRole === "NOT SET" ? null : issue.clerkRole, issue.userId],
              });
              console.log(`   ✅ Updated database role for ${issue.email}: ${issue.clerkRole}`);
            } else {
              // Update Clerk to match database
              await clerkClient.users.updateUser(issue.userId, {
                publicMetadata: { role: issue.dbRole },
              });
              console.log(`   ✅ Updated Clerk role for ${issue.email}: ${issue.dbRole}`);
            }
            fixedCount++;
          } catch (error) {
            console.error(`   ❌ Failed to fix ${issue.email}: ${error.message}`);
            issues.errors.push({ user: issue.email, error: error.message });
          }
        }
        console.log();
      }
    } else {
      console.log("✅ No role mismatches found!\n");
    }

    // Report users in Clerk but not in database
    if (issues.clerkOnly.length > 0) {
      console.log(`⚠️  USERS IN CLERK BUT NOT IN DATABASE (${issues.clerkOnly.length}):\n`);
      issues.clerkOnly.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.email}`);
        console.log(`      User ID: ${issue.userId}`);
        console.log(`      Clerk Role: ${issue.clerkRole}\n`);
      });

      if (shouldFix) {
        console.log("   🔧 Adding users to database...\n");
        for (const issue of issues.clerkOnly) {
          try {
            const email = issue.email;
            const username = email.split("@")[0];
            const role = issue.clerkRole === "NOT SET" ? "senator" : issue.clerkRole;
            
            await turso.execute({
              sql: `INSERT INTO Users (id, username, role, created_at, updated_at) 
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              args: [issue.userId, username, role],
            });
            console.log(`   ✅ Added ${email} to database with role: ${role}`);
            fixedCount++;
          } catch (error) {
            console.error(`   ❌ Failed to add ${issue.email}: ${error.message}`);
            issues.errors.push({ user: issue.email, error: error.message });
          }
        }
        console.log();
      }
    } else {
      console.log("✅ All Clerk users exist in database!\n");
    }

    // Report users in database but not in Clerk
    if (issues.dbOnly.length > 0) {
      console.log(`⚠️  USERS IN DATABASE BUT NOT IN CLERK (${issues.dbOnly.length}):\n`);
      console.log("   These are orphaned database records.\n");
      issues.dbOnly.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.username}`);
        console.log(`      User ID: ${issue.userId}`);
        console.log(`      Database Role: ${issue.dbRole}\n`);
      });

      if (shouldFix) {
        console.log("   ⚠️  Skipping orphaned database records (manual review recommended)\n");
        console.log("   💡 You may want to delete these records manually if they're not needed.\n");
      }
    } else {
      console.log("✅ No orphaned database records!\n");
    }

    // Summary
    console.log("═══════════════════════════════════════════════════════════════\n");
    console.log("📊 SUMMARY\n");
    console.log("═══════════════════════════════════════════════════════════════\n");
    console.log(`   Total Users in Clerk: ${clerkUsers.length}`);
    console.log(`   Total Users in Database: ${dbUsers.length}`);
    console.log(`   Role Mismatches: ${issues.mismatches.length}`);
    console.log(`   Clerk-Only Users: ${issues.clerkOnly.length}`);
    console.log(`   Database-Only Users: ${issues.dbOnly.length}`);
    
    if (shouldFix) {
      console.log(`   \n   ✅ Fixed: ${fixedCount}`);
      console.log(`   ❌ Errors: ${issues.errors.length}\n`);
      
      if (issues.errors.length > 0) {
        console.log("   Errors encountered:");
        issues.errors.forEach((err, index) => {
          console.log(`   ${index + 1}. ${err.user}: ${err.error}`);
        });
        console.log();
      }
    } else {
      console.log(`\n   💡 Run with --fix to automatically sync roles\n`);
    }

    console.log("═══════════════════════════════════════════════════════════════\n");

    // Exit with appropriate code
    const hasIssues = issues.mismatches.length > 0 || 
                      issues.clerkOnly.length > 0 || 
                      issues.errors.length > 0;
    
    if (!shouldFix && hasIssues) {
      console.log("⚠️  Issues found. Run with --fix to resolve them.\n");
      process.exit(1);
    } else if (shouldFix && issues.errors.length > 0) {
      console.log("⚠️  Some issues could not be fixed. Check errors above.\n");
      process.exit(1);
    } else {
      console.log("✅ All systems in sync!\n");
      process.exit(0);
    }

  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the sync
syncRoles();

