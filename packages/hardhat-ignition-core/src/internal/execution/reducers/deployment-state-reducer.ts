import type { DeploymentState } from "../types/deployment-state.js";
import type { JournalMessage } from "../types/messages.js";

import { JournalMessageType } from "../types/messages.js";

import { executionStateReducer } from "./execution-state-reducer.js";
import { wipeExecutionState } from "./helpers/deployment-state-helpers.js";

/**
 * The root level reducer for the overall deployment state.
 *
 * @param state - the deployment state
 * @param action - a message that can be journaled
 * @returns a copy of the deployment state with the message applied
 */
export function deploymentStateReducer(
  state?: DeploymentState,
  action?: JournalMessage,
): DeploymentState {
  if (state === undefined) {
    state = {
      chainId: -1,
      executionStates: {},
    };
  }

  if (action === undefined) {
    return state;
  }

  if (action.type === JournalMessageType.DEPLOYMENT_INITIALIZE) {
    return {
      ...state,
      chainId: action.chainId,
    };
  }

  if (action.type === JournalMessageType.WIPE_APPLY) {
    return wipeExecutionState(state, action);
  }

  const previousExState = state.executionStates[action.futureId];

  return {
    ...state,
    executionStates: {
      ...state.executionStates,
      [action.futureId]: executionStateReducer(previousExState, action),
    },
  };
}
