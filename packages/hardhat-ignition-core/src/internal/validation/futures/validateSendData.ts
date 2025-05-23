import type { ArtifactResolver } from "../../../types/artifact.js";
import type { DeploymentParameters } from "../../../types/deploy.js";
import type { SendDataFuture } from "../../../types/module.js";

import { HardhatError } from "@nomicfoundation/hardhat-errors";

import {
  isAccountRuntimeValue,
  isModuleParameterRuntimeValue,
} from "../../../type-guards.js";
import {
  resolvePotentialModuleParameterValueFrom,
  validateAccountRuntimeValue,
} from "../utils.js";

export async function validateSendData(
  future: SendDataFuture,
  _artifactLoader: ArtifactResolver,
  deploymentParameters: DeploymentParameters,
  accounts: string[],
): Promise<string[]> {
  const errors: HardhatError[] = [];

  /* stage two */

  const accountParams = [
    ...(isAccountRuntimeValue(future.from) ? [future.from] : []),
    ...(isAccountRuntimeValue(future.to) ? [future.to] : []),
  ];

  errors.push(
    ...accountParams.flatMap((arv) =>
      validateAccountRuntimeValue(arv, accounts),
    ),
  );

  if (isModuleParameterRuntimeValue(future.to)) {
    const param = resolvePotentialModuleParameterValueFrom(
      deploymentParameters,
      future.to,
    );

    if (param === undefined) {
      errors.push(
        new HardhatError(
          HardhatError.ERRORS.IGNITION.VALIDATION.MISSING_MODULE_PARAMETER,
          {
            name: future.to.name,
          },
        ),
      );
    } else if (typeof param !== "string") {
      errors.push(
        new HardhatError(
          HardhatError.ERRORS.IGNITION.VALIDATION.INVALID_MODULE_PARAMETER_TYPE,
          {
            name: future.to.name,
            expectedType: "string",
            actualType: typeof param,
          },
        ),
      );
    }
  }

  if (isModuleParameterRuntimeValue(future.value)) {
    const param = resolvePotentialModuleParameterValueFrom(
      deploymentParameters,
      future.value,
    );

    if (param === undefined) {
      errors.push(
        new HardhatError(
          HardhatError.ERRORS.IGNITION.VALIDATION.MISSING_MODULE_PARAMETER,
          {
            name: future.value.name,
          },
        ),
      );
    } else if (typeof param !== "bigint") {
      errors.push(
        new HardhatError(
          HardhatError.ERRORS.IGNITION.VALIDATION.INVALID_MODULE_PARAMETER_TYPE,
          {
            name: future.value.name,
            expectedType: "bigint",
            actualType: typeof param,
          },
        ),
      );
    }
  }

  return errors.map((e) => e.message);
}
