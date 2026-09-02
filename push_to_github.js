/**
 * NEXORA PULSE - GITHUB PUSH UTILITY (Node.js Isomorphic Git)
 * Initializes git repository, stages all files, creates commit, and pushes to GitHub.
 *
 * Usage:
 *   node push_to_github.js <GITHUB_REPO_URL> <GITHUB_TOKEN_OR_PASSWORD> [BRANCH]
 * Example:
 *   node push_to_github.js https://github.com/username/pulse-care.git ghp_xxxx main
 */

const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("fs");
const path = require("path");

const dir = __dirname;

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (file === "node_modules" || file === ".git" || file === "scratch") continue;
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.relative(dir, fullPath).replace(/\\/g, "/"));
    }
  }

  return arrayOfFiles;
}

async function runGitPipeline() {
  const args = process.argv.slice(2);
  const repoUrl = args[0] || process.env.GITHUB_REPO_URL;
  const token = args[1] || process.env.GITHUB_TOKEN;
  const branch = args[2] || "main";

  console.log("\n📦 Initializing Git Repository for PulseCare...");

  // 1. Initialize Git repository if needed
  try {
    await git.init({ fs, dir, defaultBranch: branch });
    console.log("✅ Git repository initialized.");
  } catch (err) {
    console.log("ℹ️ Repository already initialized.");
  }

  // 2. Stage all project files
  const filesToStage = await getAllFiles(dir);
  console.log(`📁 Staging ${filesToStage.length} project files...`);

  for (const filepath of filesToStage) {
    await git.add({ fs, dir, filepath });
  }
  console.log("✅ All project files staged.");

  // 3. Create Commit
  let sha;
  try {
    sha = await git.commit({
      fs,
      dir,
      message: "feat: Complete Nexora PulseCare platform with Doctor OPD Queue, Pharmacy FEFO, Admin Audit, and MongoDB Atlas backend",
      author: {
        name: "PulseCare Lead Engineer",
        email: "engineering@nexorapulse.com"
      }
    });
    console.log(`✅ Commit created! SHA: ${sha.slice(0, 8)}`);
  } catch (err) {
    console.log("ℹ️ No new changes to commit or commit already exists.");
  }

  // 4. Push to Remote if URL and Token are provided
  if (!repoUrl) {
    console.log("\n⚠️ To push to GitHub, please provide your repository URL and Personal Access Token (PAT):");
    console.log("   node push_to_github.js https://github.com/<USERNAME>/<REPO_NAME>.git <GITHUB_TOKEN>");
    console.log("\n💡 How to generate a GitHub Token (1 minute):");
    console.log("   1. Go to https://github.com/settings/tokens");
    console.log("   2. Generate new token (classic) -> Check 'repo' scope -> Copy token");
    console.log("   3. Run: node push_to_github.js <YOUR_REPO_URL> <TOKEN>\n");
    return;
  }

  console.log(`\n🚀 Pushing to GitHub: ${repoUrl} [branch: ${branch}]...`);
  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: "origin",
      url: repoUrl,
      ref: branch,
      force: true,
      onAuth: () => ({ username: token || "oauth2", password: token })
    });

    console.log("🎉 Successfully pushed all project data to GitHub!");
    console.log("Result:", pushResult);
  } catch (err) {
    console.error("❌ Git Push Error:", err.message);
    console.log("💡 Tip: Verify your GitHub Token has 'repo' push permissions and repository URL is correct.");
  }
}

runGitPipeline();
