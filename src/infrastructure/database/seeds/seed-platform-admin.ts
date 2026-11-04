import "dotenv/config";
import dataSource from "../data-source";
import { PlatformRole } from "../../../users/domain/user";
import { UserEntity } from "../../../users/infrastructure/out/persistence/user.entity";

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  let issuer = process.env.PLATFORM_ADMIN_ISSUER;
  let subject = process.env.PLATFORM_ADMIN_SUBJECT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--issuer" && args[i + 1]) {
      issuer = args[i + 1];
    } else if (args[i] === "--subject" && args[i + 1]) {
      subject = args[i + 1];
    }
  }

  if (!issuer || !subject) {
    console.error(
      "Error: PLATFORM_ADMIN_ISSUER and PLATFORM_ADMIN_SUBJECT must be specified via environment variables or CLI flags (--issuer, --subject).",
    );
    process.exit(1);
  }

  console.log(`Connecting to database to provision platform admin...`);
  await dataSource.initialize();

  try {
    const userRepository = dataSource.getRepository(UserEntity);
    let user = await userRepository.findOne({
      where: { issuer, subject },
    });

    if (user) {
      user.platformRole = PlatformRole.Admin;
      await userRepository.save(user);
      console.log(
        `[Seed] Existing user updated with platform_admin role (User ID: ${user.id}).`,
      );
    } else {
      user = userRepository.create({
        issuer,
        subject,
        platformRole: PlatformRole.Admin,
      });
      await userRepository.save(user);
      console.log(
        `[Seed] New user created and provisioned with platform_admin role (User ID: ${user.id}).`,
      );
    }
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error("Failed to seed platform admin:", error);
  process.exit(1);
});

