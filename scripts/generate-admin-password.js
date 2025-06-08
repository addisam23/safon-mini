const bcrypt = require("bcryptjs")

async function generatePasswordHash() {
  try {
    // Generate hash for the password "Addis2379"
    const password = "Addis2379"
    const saltRounds = 12

    console.log("Generating password hash for:", password)

    const hash = await bcrypt.hash(password, saltRounds)
    console.log("Generated hash:", hash)

    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash)
    console.log("Hash verification:", isValid ? "SUCCESS" : "FAILED")

    // Also generate hash for backup admin password
    const backupPassword = "admin123"
    const backupHash = await bcrypt.hash(backupPassword, saltRounds)
    console.log('\nBackup admin password hash for "admin123":', backupHash)

    return {
      password,
      hash,
      backupPassword,
      backupHash,
    }
  } catch (error) {
    console.error("Error generating password hash:", error)
  }
}

generatePasswordHash()
