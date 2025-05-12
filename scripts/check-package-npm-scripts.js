// @ts-check
import { readdirSync } from "node:fs"
import { resolve } from "node:path"

import { scripts } from "../packages/template-package/package.json"

const vNextDir = resolve(__dirname, "../packages")
const dirs = readdirSync(vNextDir, { withFileTypes: true })

let errorsFound = false

for (const dir of dirs) {
	if (!dir.isDirectory()) {
		continue
	}

	// This config package don't have same scripts.
	if (dir.name === "config") {
		continue
	}

	// The test reporter is a special case, as it doesn't use itself as test
	// reporter
	if (dir.name === "hardhat-node-test-reporter") {
		continue
	}

	// Same with the example project, we don't use the same scripts
	if (dir.name === "example-project") {
		continue
	}

	// TODO: This is a temporary solution until we convert Ignitions tests
	// to Node Test Runner.
	if (dir.name === "hardhat-ignition-core") {
		continue
	}

	// TODO: This is a temporary solution until we convert Ignitions tests
	// to Node Test Runner.
	if (dir.name === "hardhat-ignition-ui") {
		continue
	}

	// TODO: This is a temporary solution until we convert Ignitions tests
	// to Node Test Runner.
	if (dir.name === "hardhat-ignition") {
		continue
	}

	// TODO: This is a temporary solution until we convert Ignitions tests
	// to Node Test Runner.
	if (dir.name === "hardhat-ignition-viem") {
		continue
	}

	const packageJsonPath = resolve(vNextDir, dir.name, "package.json")
	const packageJson = require(packageJsonPath)

	for (const scriptName in scripts) {
		if (scriptName === "clean") {
			if (!packageJson.scripts[scriptName].startsWith(scripts[scriptName])) {
				console.error(`Mismatch in script ${scriptName} in ${dir.name}`)
				console.error(`  Expected to start with: ${scripts[scriptName]}`)
				console.error(`  Actual: ${packageJson.scripts[scriptName]}`)
				console.error()

				errorsFound = true
			}

			continue
		}

		if (scripts[scriptName] !== packageJson.scripts[scriptName]) {
			console.error(`Mismatch in script ${scriptName} in ${dir.name}`)
			console.error(`  Expected: ${scripts[scriptName]}`)
			console.error(`  Actual:   ${packageJson.scripts[scriptName] ?? ""}`)
			console.error()

			errorsFound = true
		}
	}
}

if (errorsFound) {
	process.exitCode = 1
}
