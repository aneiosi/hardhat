import type {
  CallExecutionState,
  DeploymentExecutionState,
  SendDataExecutionState,
  StaticCallExecutionState,
} from "../../types/execution-state.js";

import { NetworkInteractionType } from "../../types/network-interaction.js";

/**
 * The next action that the FutureProcessor should take.
 */
export enum NextAction {
  /**
   * This action is used when the latest network interaction was completed
   * and the execution strategy should be run again, to understand how to
   * proceed.
   */
  RUN_STRATEGY = "RUN_STRATEGY",

  /**
   * This action is used when the latest network interaction is an OnchainInteraction
   * that requires sending a new transaction.
   */
  SEND_TRANSACTION = "SEND_TRANSACTION",

  /**
   * This action is used when the latest network interaction is a StaticCall that
   * hasn't been run yet.
   */
  QUERY_STATIC_CALL = "QUERY_STATIC_CALL",

  /**
   * This action is used when the latest network interaction is an OnchainInteraction
   * that has one or more in-flight transactions, and we need to monitor them.
   */
  MONITOR_ONCHAIN_INTERACTION = "MONITOR_ONCHAIN_INTERACTION",
}

/**
 * Returns the next action to be run for an execution state.
 */
export function nextActionForExecutionState(
  exState:
    | DeploymentExecutionState
    | CallExecutionState
    | SendDataExecutionState
    | StaticCallExecutionState,
): NextAction {
  const interaction = exState.networkInteractions.at(-1);

  if (interaction === undefined) {
    return NextAction.RUN_STRATEGY;
  }

  switch (interaction.type) {
    case NetworkInteractionType.ONCHAIN_INTERACTION: {
      if (interaction.transactions.length === 0) {
        return NextAction.SEND_TRANSACTION;
      } else {
        const receipt = interaction.transactions.find(
          (tx) => tx.receipt !== undefined,
        );

        if (receipt !== undefined) {
          // We got a confirmed transaction
          return NextAction.RUN_STRATEGY;
        }

        if (interaction.shouldBeResent) {
          return NextAction.SEND_TRANSACTION;
        }

        // Wait for confirmations, drops, or nonce invalidation
        return NextAction.MONITOR_ONCHAIN_INTERACTION;
      }
    }
    case NetworkInteractionType.STATIC_CALL: {
      if (interaction.result !== undefined) {
        return NextAction.RUN_STRATEGY;
      }

      return NextAction.QUERY_STATIC_CALL;
    }
  }
}
