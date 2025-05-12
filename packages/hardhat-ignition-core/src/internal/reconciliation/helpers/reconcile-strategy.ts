import type {
  ContractAtFuture,
  ContractCallFuture,
  ContractDeploymentFuture,
  EncodeFunctionCallFuture,
  LibraryDeploymentFuture,
  NamedArtifactContractAtFuture,
  NamedArtifactContractDeploymentFuture,
  NamedArtifactLibraryDeploymentFuture,
  ReadEventArgumentFuture,
  SendDataFuture,
  StaticCallFuture,
} from "../../../types/module.js";
import type {
  CallExecutionState,
  ContractAtExecutionState,
  DeploymentExecutionState,
  EncodeFunctionCallExecutionState,
  ReadEventArgumentExecutionState,
  SendDataExecutionState,
  StaticCallExecutionState,
} from "../../execution/types/execution-state.js";
import type {
  ReconciliationContext,
  ReconciliationFutureResultFailure,
} from "../types.js";

import isEqual from "lodash-es/isEqual.js";

import { ExecutionStatus } from "../../execution/types/execution-state.js";
import { fail } from "../utils.js";

export function reconcileStrategy(
  future:
    | NamedArtifactContractDeploymentFuture<string>
    | ContractDeploymentFuture
    | NamedArtifactLibraryDeploymentFuture<string>
    | LibraryDeploymentFuture
    | NamedArtifactContractAtFuture<string>
    | ContractAtFuture
    | ContractCallFuture<string, string>
    | StaticCallFuture<string, string>
    | EncodeFunctionCallFuture<string, string>
    | SendDataFuture
    | ReadEventArgumentFuture,
  exState:
    | DeploymentExecutionState
    | CallExecutionState
    | StaticCallExecutionState
    | EncodeFunctionCallExecutionState
    | ContractAtExecutionState
    | SendDataExecutionState
    | ReadEventArgumentExecutionState,
  context: ReconciliationContext,
): ReconciliationFutureResultFailure | undefined {
  /**
   * If the execution was successful, we don't need to reconcile the strategy.
   *
   * The strategy is set per run, so reconciling already completed futures
   * would lead to a false positive. We only want to reconcile futures that
   * will be run again.
   */
  if (exState.status === ExecutionStatus.SUCCESS) {
    return undefined;
  }

  const storedStrategyName = exState.strategy;
  const newStrategyName = context.strategy;

  if (storedStrategyName !== newStrategyName) {
    return fail(
      future,
      `Strategy changed from "${storedStrategyName}" to "${newStrategyName}"`,
    );
  }

  // We may have an `undefined` strategy config when reading a journal, as
  // some previous versions of Ignition didn't set this property
  const storedStrategyConfig = exState.strategyConfig ?? {};
  const newStrategyConfig = context.strategyConfig;

  if (!isEqual(storedStrategyConfig, newStrategyConfig)) {
    return fail(
      future,
      `Strategy config changed from ${JSON.stringify(
        storedStrategyConfig,
      )} to ${JSON.stringify(newStrategyConfig)}`,
    );
  }
}
