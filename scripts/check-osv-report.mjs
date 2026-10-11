import { readFileSync, appendFileSync } from 'node:fs';

export function securityCounts(report) {
  if (report?.version !== '2.1.0' || !Array.isArray(report.runs) || report.runs.length === 0) {
    throw new Error('Invalid or missing SARIF report');
  }
  const counts = { critical: 0, high: 0, findings: 0 };
  for (const run of report.runs) {
    if (!Array.isArray(run.results)) throw new Error('Missing scanner results');
    const rules = run.tool?.driver?.rules ?? [];
    for (const result of run.results) {
      const rule = rules.find((entry) => entry.id === result.ruleId) ?? rules[result.ruleIndex];
      const rawScore = rule?.properties?.['security-severity'];
      if (typeof rawScore !== 'string' || !rawScore.trim()) throw new Error('Unknown finding severity');
      const score = Number(rawScore);
      if (!Number.isFinite(score) || score < 0 || score > 10) throw new Error('Unknown finding severity');
      counts.findings++;
      if (score >= 9) counts.critical++;
      else if (score >= 7) counts.high++;
    }
  }
  return counts;
}

if (process.argv[1]?.endsWith('/check-osv-report.mjs')) {
  const status = Number(process.env.OSV_SCAN_EXIT ?? 0);
  if (status !== 0 && status !== 1) throw new Error('Security scanner failed');
  const counts = securityCounts(JSON.parse(readFileSync(process.argv[2], 'utf8')));
  if (status === 1 && counts.findings === 0) throw new Error('Scanner failure without findings');
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `critical=${counts.critical}\nhigh=${counts.high}\n`);
  }
  process.stdout.write(JSON.stringify(counts) + '\n');
  if (counts.critical > 0 || counts.high > 0) process.exitCode = 1;
}
