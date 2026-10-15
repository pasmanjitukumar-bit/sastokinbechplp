import { execFileSync, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
// Local Windows antivirus may inspect HTTPS/SMTP using a locally trusted root.
// Export the OS trust store rather than weakening TLS certificate verification.
const env = { ...process.env };
if (process.platform === "win32" && !env.NODE_EXTRA_CA_CERTS) {
  const directory = path.join(os.tmpdir(), "sastokinbech-tls");
  mkdirSync(directory, { recursive: true });
  const file = path.join(directory, "trusted-ca.pem");
  const script = `$ErrorActionPreference='Stop'; $blocks=foreach($location in @('CurrentUser','LocalMachine')){foreach($name in @('Root','CA')){$store=New-Object System.Security.Cryptography.X509Certificates.X509Store($name,$location); $store.Open('ReadOnly'); foreach($certificate in $store.Certificates){'-----BEGIN CERTIFICATE-----'+[Environment]::NewLine+[Convert]::ToBase64String($certificate.RawData,[Base64FormattingOptions]::InsertLineBreaks)+[Environment]::NewLine+'-----END CERTIFICATE-----'}; $store.Close()}}; [IO.File]::WriteAllText($env:SASTO_CA_OUTPUT,($blocks -join [Environment]::NewLine))`;
  execFileSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      env: { ...env, SASTO_CA_OUTPUT: file },
      windowsHide: true,
      stdio: "pipe",
    },
  );
  env.NODE_EXTRA_CA_CERTS = file;
}
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3015",
  ],
  { env, stdio: "inherit" },
);
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
process.on("SIGINT", () => child.kill("SIGINT"));
