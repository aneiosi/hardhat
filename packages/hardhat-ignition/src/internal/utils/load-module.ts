import type { IgnitionModule } from "@nomicfoundation/ignition-core";

import path from "node:path";
import { pathToFileURL } from "node:url";

import { HardhatError } from "@nomicfoundation/hardhat-errors";
import { exists } from "@nomicfoundation/hardhat-utils/fs";
import setupDebug from "debug";

const debug = setupDebug("hardhat-ignition:modules");

const MODULES_FOLDER = "modules";

export async function loadModule(
  ignitionDirectory: string,
  modulePath: string,
): Promise<IgnitionModule | undefined> {
  const fullModulesDirectoryName = path.resolve(
    ignitionDirectory,
    MODULES_FOLDER,
  );

  const shortModulesDirectoryName = path.join(
    ignitionDirectory,
    MODULES_FOLDER,
  );

  debug(`Loading user modules from '${fullModulesDirectoryName}'`);

  const fullpathToModule = path.resolve(modulePath);

  if (!(await exists(fullpathToModule))) {
    throw new HardhatError(
      HardhatError.ERRORS.IGNITION.INTERNAL.MODULE_NOT_FOUND_AT_PATH,
      {
        modulePath,
      },
    );
  }

  if (!isInModuleDirectory(fullModulesDirectoryName, fullpathToModule)) {
    throw new HardhatError(
      HardhatError.ERRORS.IGNITION.INTERNAL.MODULE_OUTSIDE_MODULE_DIRECTORY,
      {
        modulePath,
        shortModulesDirectoryName,
      },
    );
  }

  debug(`Loading module file '${fullpathToModule}'`);

  let module;
  try {
    module = await import(pathToFileURL(fullpathToModule).href);
  } catch (e) {
    if (HardhatError.isHardhatError(e)) {
      /**
       * Errors thrown from within ModuleBuilder use this error number.
       *
       * They have a stack trace that's useful to the user, so we display it here, instead of
       * wrapping the error in a HardhatError.
       */
      if (e.number === 10702) {
        console.error(e);

        throw new HardhatError(
          HardhatError.ERRORS.IGNITION.INTERNAL.MODULE_VALIDATION_FAILED,
          e,
        );
      }
    }

    throw e;
  }

  return module.default ?? module;
}

function isInModuleDirectory(modulesDirectory: string, modulePath: string) {
  const resolvedModulesDirectory = path.resolve(modulesDirectory);
  const moduleRelativeToModuleDir = path.relative(
    resolvedModulesDirectory,
    modulePath,
  );

  return (
    !moduleRelativeToModuleDir.startsWith("..") &&
    !path.isAbsolute(moduleRelativeToModuleDir)
  );
}
