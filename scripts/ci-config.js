/* Spouští se v GitHub Actions těsně před buildem. Podle toho, jaké tajné hodnoty (secrets) máš v repozitáři,
   zapne podepisování. Bez nich se build chová jako dřív (nepodepsaný) a nic se nerozbije. */
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const e = process.env, has = k => !!(e[k] && e[k].trim());
p.build = p.build || {};

if (process.platform === 'win32' && has('AZURE_CLIENT_ID') && has('AZURE_TENANT_ID') && has('AZURE_CLIENT_SECRET')) {
  // Azure Artifact Signing (dříve Trusted Signing) – podpis v cloudu, bez USB tokenu
  p.build.win = Object.assign({}, p.build.win, {
    azureSignOptions: {
      publisherName: e.AZURE_PUBLISHER_NAME,
      endpoint: e.AZURE_ENDPOINT,
      codeSigningAccountName: e.AZURE_CODE_SIGNING_ACCOUNT,
      certificateProfileName: e.AZURE_CERT_PROFILE
    }
  });
  console.log('Windows: podepisuji přes Azure Artifact Signing');
} else if (process.platform === 'win32' && has('WIN_CSC_LINK')) {
  console.log('Windows: podepisuji certifikátem (.pfx)');   // WIN_CSC_LINK + WIN_CSC_KEY_PASSWORD si electron-builder načte sám
}

if (process.platform === 'darwin' && has('CSC_LINK') && has('APPLE_ID') && has('APPLE_APP_SPECIFIC_PASSWORD') && has('APPLE_TEAM_ID')) {
  p.build.mac = Object.assign({}, p.build.mac, { hardenedRuntime: true, gatekeeperAssess: false, notarize: true });
  console.log('macOS: podepisuji a notarizuji');
}

fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
