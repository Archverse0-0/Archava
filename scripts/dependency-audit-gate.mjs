#!/usr/bin/env node
/**
 * Narrow, documented dependency-audit gate.
 *
 * Why this exists
 * ---------------
 * `npm audit --audit-level=high` was previously hidden behind a blanket
 * `continue-on-error: true`, which reported a green job while 2 critical and
 * 17 high advisories were outstanding. That is worse than no check at all,
 * because it manufactures assurance.
 *
 * This gate replaces it with something that cannot lie:
 *
 *   * every high/critical advisory that is NOT listed in
 *     `security/dependency-allowlist.json` fails the job, so a newly
 *     published advisory breaks the build immediately;
 *   * every allowlist entry carries a written justification and an
 *     `expiresOn` date, and an expired entry fails the job, so exceptions
 *     cannot quietly become permanent;
 *   * low/moderate findings are summarised but non-blocking, because the
 *     project cannot currently absorb six semver-major upgrades at once.
 *
 * The allowlist therefore only ever *narrows* what already passed. Deleting
 * an entry, or letting it lapse, makes the gate stricter — never looser.
 *
 * Exit codes: 0 = pass, 1 = audit findings block the build, 2 = the
 * allowlist itself is malformed (this is a repo bug, not an audit result).
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWLIST_PATH = join(repoRoot, "security", "dependency-allowlist.json");

/** Severity ranking used for both filtering and stable output ordering. */
const SEVERITY_RANK = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };

function failSetup(message) {
  console.error(`[audit-gate] allowlist is unusable: ${message}`);
  process.exit(2);
}

function loadAllowlist() {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
  } catch (err) {
    failSetup(`${ALLOWLIST_PATH} could not be parsed: ${err.message}`);
  }

  const gate = parsed.gate ?? {};
  const blockOn = new Set(gate.blockOn ?? ["high", "critical"]);
  if (blockOn.size === 0) {
    failSetup("gate.blockOn is empty; every finding would be non-blocking.");
  }

  const exceptions = new Map();
  for (const entry of parsed.exceptions ?? []) {
    if (typeof entry.advisory !== "string" || !entry.advisory.startsWith("https://")) {
      failSetup(`entry is missing a valid "advisory" URL: ${JSON.stringify(entry)}`);
    }
    if (typeof entry.reason !== "string" || entry.reason.trim().length < 20) {
      failSetup(`${entry.advisory} needs a substantive "reason" (>= 20 characters).`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(entry.expiresOn ?? ""))) {
      failSetup(`${entry.advisory} needs an "expiresOn" date in YYYY-MM-DD form.`);
    }
    exceptions.set(entry.advisory, entry);
  }

  return { blockOn, exceptions };
}

function runAudit() {
  let stdout;
  try {
    stdout = execFileSync("npm", ["audit", "--json", "--legacy-peer-deps"], {
      cwd: repoRoot,
      encoding: "utf8",
      // `npm audit` exits non-zero whenever anything is found, including
      // findings this gate treats as non-blocking, so the exit code carries
      // no information we need.
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (err) {
    // Non-zero exit is the normal case; the report still arrives on stdout.
    if (typeof err.stdout === "string" && err.stdout.trim()) {
      stdout = err.stdout;
    } else {
      console.error(`[audit-gate] \`npm audit\` produced no report: ${err.message}`);
      process.exit(1);
    }
  }

  try {
    return JSON.parse(stdout);
  } catch (err) {
    console.error(`[audit-gate] could not parse npm audit output: ${err.message}`);
    process.exit(1);
  }
}

function main() {
  const { blockOn, exceptions } = loadAllowlist();
  const report = runAudit();

  const metadata = report.metadata?.vulnerabilities ?? {};
  const total = metadata.total ?? 0;

  console.log(
    `[audit-gate] npm audit: ${total} finding(s) — ` +
      `critical=${metadata.critical ?? 0} high=${metadata.high ?? 0} ` +
      `moderate=${metadata.moderate ?? 0} low=${metadata.low ?? 0} ` +
      `info=${metadata.info ?? 0}`
  );
  if (total === 0) {
    console.log("[audit-gate] no advisories reported; nothing to gate.");
    return;
  }

  /**
   * Every advisory npm reported, keyed by URL. Used both to gate the
   * blocking severities and to detect allowlist entries that no longer
   * correspond to anything npm reports.
   * @type {Map<string, {advisory: object, packages: Set<string>}>}
   */
  const byAdvisory = new Map();
  /** @type {string[]} */
  const nonBlocking = [];

  for (const [pkg, finding] of Object.entries(report.vulnerabilities ?? {})) {
    const severity = String(finding.severity ?? "info").toLowerCase();
    const advisories = (finding.via ?? []).filter((v) => typeof v === "object");

    if (advisories.length === 0) {
      // A vulnerability whose `via` entries are all plain strings is only
      // reachable through one of its own dependencies; the dependency's own
      // entry carries the advisory, so there is nothing to gate here.
      continue;
    }

    for (const advisory of advisories) {
      const url = advisory.url;
      if (!url) continue;
      if (!byAdvisory.has(url)) {
        byAdvisory.set(url, { advisory, packages: new Set() });
      }
      byAdvisory.get(url).packages.add(pkg);
    }

    // Only the blocking severities gate the build; everything else is
    // summarised so the count is never silently dropped from the log.
    if (!blockOn.has(severity)) {
      nonBlocking.push(`${severity} ${pkg}`);
    }
  }

  // Only the severities named in `gate.blockOn` gate the build. The rest are
  // recorded in the allowlist as documentation, and are summarised below.
  const blocking = [...byAdvisory.values()]
    .filter(({ advisory }) => blockOn.has(String(advisory.severity ?? "info").toLowerCase()))
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.advisory.severity] - SEVERITY_RANK[b.advisory.severity] ||
        a.advisory.title.localeCompare(b.advisory.title)
    );

  const unexcused = [];
  const expired = [];
  const accepted = [];

  for (const { advisory, packages } of blocking) {
    const entry = exceptions.get(advisory.url);
    if (!entry) {
      unexcused.push({ advisory, packages });
      continue;
    }
    const expiresOn = new Date(`${entry.expiresOn}T23:59:59Z`);
    if (Number.isNaN(expiresOn.getTime())) {
      failSetup(`${advisory.url} has an unparseable expiresOn: ${entry.expiresOn}`);
    }
    if (expiresOn.getTime() < Date.now()) {
      expired.push({ advisory, packages, entry });
      continue;
    }
    accepted.push({ advisory, packages, entry });
  }

  for (const { advisory, packages } of accepted) {
    console.log(
      `[audit-gate]   accepted ${advisory.severity} ${advisory.url}\n` +
        `              ${advisory.title}\n` +
        `              packages: ${[...packages].sort().join(", ")}\n` +
        `              justification: ${exceptions.get(advisory.url).reason}\n` +
        `              expires: ${exceptions.get(advisory.url).expiresOn}`
    );
  }

  // An allowlist entry for an advisory npm no longer reports means the tree
  // moved on. That is good news, so it is a cleanup hint rather than a
  // failure — but it must still be visible, otherwise the file rots.
  const stale = [...exceptions.keys()].filter((url) => !byAdvisory.has(url));
  if (stale.length > 0) {
    console.log(
      "[audit-gate] note: allowlist entries no longer reported by npm audit " +
        "(safe to remove):"
    );
    for (const url of stale) console.log(`[audit-gate]   - ${url}`);
  }

  if (nonBlocking.length > 0) {
    console.log(
      `[audit-gate] ${nonBlocking.length} non-blocking finding(s) ` +
        `(${[...blockOn].join("/")} block the build); see DEPENDENCY_REMEDIATION.md.`
    );
  }

  if (unexcused.length > 0) {
    console.error(
      `\n[audit-gate] BLOCKING: ${unexcused.length} high/critical advisory finding(s) ` +
        `with no documented exception.`
    );
    for (const { advisory, packages } of unexcused) {
      console.error(
        `  ${advisory.severity}  ${advisory.url}\n` +
          `    ${advisory.title}\n` +
          `    range: ${advisory.range ?? "n/a"}  packages: ${[...packages].sort().join(", ")}`
      );
    }
    console.error(
      "\n[audit-gate] Fix the dependency, or add a dated, justified entry to " +
        "security/dependency-allowlist.json explaining why it is accepted."
    );
    process.exit(1);
  }

  if (expired.length > 0) {
    console.error(
      `\n[audit-gate] BLOCKING: ${expired.length} allowlist exception(s) have expired ` +
        `and must be re-triaged.`
    );
    for (const { advisory, entry } of expired) {
      console.error(
        `  ${advisory.severity}  ${advisory.url} expired ${entry.expiresOn}\n` +
          `    ${advisory.title}`
      );
    }
    console.error(
      "\n[audit-gate] Re-assess each one and either remediate or renew the " +
        "expiresOn date with an updated justification."
    );
    process.exit(1);
  }

  console.log(
    `[audit-gate] pass — ${accepted.length} high/critical advisory finding(s) ` +
      `are individually justified in security/dependency-allowlist.json; ` +
      `nothing unreported is accepted.`
  );
}

main();
