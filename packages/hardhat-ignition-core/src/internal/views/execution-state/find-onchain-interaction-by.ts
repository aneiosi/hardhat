import type {
  CallExecutionState,
  DeploymentExecutionState,
  SendDataExecutionState,
  StaticCallExecutionState,
} from "../../execution/types/execution-state.js";
import type { OnchainInteraction } from "../../execution/types/network-interaction.js";

import { NetworkInteractionType } from "../../execution/types/network-interaction.js";
import { assertIgnitionInvariant } from "../../utils/assertions.js";

export function findOnchainInteractionBy(
  executionState:
    | DeploymentExecutionState
    | CallExecutionState
    | StaticCallExecutionState
    | SendDataExecutionState,
  networkInteractionId: number,
): OnchainInteraction {
  const onchainInteraction = executionState.networkInteractions.find(
    (interaction) => interaction.id === networkInteractionId,
  );

  assertIgnitionInvariant(
    onchainInteraction !== undefined,
    `Expected network interaction ${executionState.id}/${networkInteractionId} to exist, but it did not`,
  );

  assertIgnitionInvariant(
    onchainInteraction.type === NetworkInteractionType.ONCHAIN_INTERACTION,
    `Expected network interaction ${executionState.id}/${networkInteractionId} to be an onchain interaction, but instead it was ${onchainInteraction.type}`,
  );

  return onchainInteraction;
}
