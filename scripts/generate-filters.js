// @ts-check
/**
 * This script generates filters for https://github.com/dorny/paths-filter
 *
 * It is used in CI to find all the packages which have been modified or
 * have a dependency (including transitive) that has been modified.
 *
 * This enables running checks only for the packages affected by the changes.
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

function main() {
	const packageIgnore = JSON.parse(process.env.PACKAGE_IGNORE || "[]")
	const commonFilters = JSON.parse(process.env.COMMON_FILTERS || "[]")

	const pnpmLockfilePath = join(__dirname, "..", "pnpm-lock.json")
	if (!existsSync(pnpmLockfilePath)) {
		console.warn(
			`${pnpmLockfilePath} doesn't exist, please run: yq -p yaml -o json pnpm-lock.yaml | tee pnpm-lock.json`,
		)
		process.exit(1)
	}

	const pnpmLockfile = JSON.parse(readFileSync(pnpmLockfilePath, "utf8"))

	// Find all direct internal dependencies for all packages
	const internalDependenciesMap = {}
	for (const [pkg, allDependencies] of Object.entries(pnpmLockfile.importers)) {
		const internalDependencies = Object.values(allDependencies)
			.flatMap((dependencies) => Object.values(dependencies))
			.map((dependency) => dependency.version)
			.filter((version) => version.startsWith("link:"))
			.map((version) => version.replace("link:", ""))
			.map((version) => join(pkg, version))
		internalDependenciesMap[pkg] = internalDependencies
	}

	// Add transitive internal dependencies
	for (const dependencies of Object.values(internalDependenciesMap)) {
		const dependencyQueue = [...dependencies]
		while (dependencyQueue.length !== 0) {
			const dependency = dependencyQueue.pop()
			for (const transitiveDependency of internalDependenciesMap[dependency]) {
				if (!dependencies.includes(transitiveDependency)) {
					dependencies.push(transitiveDependency)
					dependencyQueue.push(transitiveDependency)
				}
			}
		}
	}

	// Generate filters
	const filters = {}
	for (const [pkg, dependencies] of Object.entries(internalDependenciesMap)) {
		// Ignore packages that start with one of the prefixes in PACKAGE_IGNORE
		if (packageIgnore.some((prefix) => pkg.startsWith(prefix))) {
			continue
		}
		// Calculate glob patterns for the package and its dependencies
		const packageFilters = [pkg, ...dependencies].map((dependency) => join(dependency, "**"))
		// Set filters for the package
		filters[pkg] = [...commonFilters, ...packageFilters]
	}

	// Pretty print the filters
	console.log(JSON.stringify(filters, null, 2))
}

main()
