export default function CreateModule(moduleName: string, moduleDescription: string | undefined) {
  const fs = require("fs");
  const path = require("path");

  const modulePath = path.resolve(`./modules/${moduleName}`);

  if (fs.existsSync(modulePath)) {
    console.log("Error: Module already exists | Cancelling");
    process.exit(1);
  }

  const moduleIndex = fs
    .readFileSync(path.resolve("./cli/resources/module.index.template"), "utf8")
    .toString()
    .replace(/<name>/g, moduleName)
    .replace(
      /<nameUppercase>/g,
      moduleName
        .split("")
        .map((c, i) => (i === 0 ? c.toUpperCase() : c))
        .join("")
    )
    .replace(/<desc>/g, moduleDescription || "No description provided");

  const moduleManifest = fs
    .readFileSync(path.resolve("./cli/resources/module.manifest.template"), "utf8")
    .toString()
    .replace(/<desc>/g, moduleDescription || "No description provided")
    .replace(
      /<nameUppercase>/g,
      moduleName
        .split("")
        .map((c, i) => (i === 0 ? c.toUpperCase() : c))
        .join("")
    );

  const exampleCommand = fs
    .readFileSync(path.resolve("./cli/resources/module.command.example.template"), "utf8")
    .toString()
    .replace(
      /<nameUppercase>/g,
      moduleName
        .split("")
        .map((c, i) => (i === 0 ? c.toUpperCase() : c))
        .join("")
    );

  fs.mkdirSync(modulePath);
  fs.mkdirSync(`${modulePath}/commands`);
  fs.mkdirSync(`${modulePath}/interactions`);
  fs.mkdirSync(`${modulePath}/entities`);
  fs.writeFileSync(`${modulePath}/index.ts`, moduleIndex);
  fs.writeFileSync(`${modulePath}/manifest.json`, moduleManifest);
  fs.writeFileSync(`${modulePath}/commands/example.ts`, exampleCommand);

  console.log(`Created module ${moduleName}`);
}
