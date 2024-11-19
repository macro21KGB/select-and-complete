import { readFileSync, writeFileSync } from "fs";
import readline from "readline";

// Leggi il file manifest.json
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { version, minAppVersion } = manifest;

// Mostra la versione corrente
console.log(`Versione corrente: ${version}`);
const [major, minor, patch] = version.split('.').map(Number);

// Configura readline per ottenere input dall'utente
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Quale parte della versione vuoi incrementare? (major/minor/patch): ', (bumpType) => {
	let newVersion;
	switch (bumpType) {
		case 'major':
			newVersion = `${major + 1}.0.0`;
			break;
		case 'minor':
			newVersion = `${major}.${minor + 1}.0`;
			break;
		case 'patch':
			newVersion = `${major}.${minor}.${patch + 1}`;
			break;
		default:
			console.log('Scelta non valida. Uscita.');
			rl.close();
			process.exit(1);
	}

	// Aggiorna la versione nel file manifest.json
	manifest.version = newVersion;
	writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

	// Aggiorna il file versions.json con la nuova versione e minAppVersion
	let versions = JSON.parse(readFileSync("versions.json", "utf8"));
	versions[newVersion] = minAppVersion;
	writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

	// Aggiorna la versione nel file package.json
	let packageJson = JSON.parse(readFileSync("package.json", "utf8"));
	packageJson.version = newVersion;
	writeFileSync("package.json", JSON.stringify(packageJson, null, "\t"));

	console.log(`Versione aggiornata a: ${newVersion}`);
	rl.close();
});
