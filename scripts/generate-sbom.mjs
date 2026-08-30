import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'artifacts', 'lanvexa-site.cdx.json');
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error('Run this generator through `npm run sbom` so the npm CLI path is known.');
  process.exit(1);
}
const result = spawnSync(process.execPath, [npmCli, 'sbom', '--sbom-format', 'cyclonedx'], { cwd: root, encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'npm sbom failed');
  process.exit(result.status || 1);
}
let sbom;
try { sbom = JSON.parse(result.stdout); } catch { console.error('npm sbom did not return valid JSON'); process.exit(1); }
mkdirSync(resolve(root, 'artifacts'), { recursive: true });
writeFileSync(output, `${JSON.stringify(sbom, null, 2)}\n`);
console.log(`Wrote ${output}`);
