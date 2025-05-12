import type { DeploymentLoader } from "./deployment-loader/types.js";
import type { DeploymentState } from "./execution/types/deployment-state.js";
import type { WipeExecutionStateMessage } from "./execution/types/messages.js";

import { HardhatError } from "@nomicfoundation/hardhat-errors";

import {
  applyNewMessage,
  loadDeploymentState,
} from "./execution/deployment-state-helpers.js";
import { JournalMessageType } from "./execution/types/messages.js";

export class Wiper {
  constructor(private readonly _deploymentLoader: DeploymentLoader) {}

  public async wipe(futureId: string): Promise<DeploymentState> {
    const deploymentState = await loadDeploymentState(this._deploymentLoader);

    if (deploymentState === undefined) {
      throw new HardhatError(
        HardhatError.ERRORS.IGNITION.WIPE.UNINITIALIZED_DEPLOYMENT,
        {
          futureId,
        },
      );
    }

    const executionState = deploymentState.executionStates[futureId];

    if (executionState === undefined) {
      throw new HardhatError(
        HardhatError.ERRORS.IGNITION.WIPE.NO_STATE_FOR_FUTURE,
        { futureId },
      );
    }

    const dependents = Object.values(deploymentState.executionStates).filter(
      (psm) => psm.dependencies.has(futureId),
    );

    if (dependents.length > 0) {
      throw new HardhatError(
        HardhatError.ERRORS.IGNITION.WIPE.DEPENDENT_FUTURES,
        {
          futureId,
          dependents: dependents.map((d) => d.id).join(", "),
        },
      );
    }

    const wipeMessage: WipeExecutionStateMessage = {
      type: JournalMessageType.WIPE_APPLY,
      futureId,
    };

    return applyNewMessage(
      wipeMessage,
      deploymentState,
      this._deploymentLoader,
    );
  }
}
