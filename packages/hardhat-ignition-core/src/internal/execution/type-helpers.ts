import type {
  CallExecutionState,
  ContractAtExecutionState,
  DeploymentExecutionState,
  ExecutionSateType,
  ReadEventArgumentExecutionState,
  SendDataExecutionState,
  StaticCallExecutionState,
} from "./types/execution-state.js";

export type MapExStateTypeToExState<ExStateT extends ExecutionSateType> =
  ExStateT extends ExecutionSateType.DEPLOYMENT_EXECUTION_STATE
    ? DeploymentExecutionState
    : ExStateT extends ExecutionSateType.CALL_EXECUTION_STATE
      ? CallExecutionState
      : ExStateT extends ExecutionSateType.STATIC_CALL_EXECUTION_STATE
        ? StaticCallExecutionState
        : ExStateT extends ExecutionSateType.SEND_DATA_EXECUTION_STATE
          ? SendDataExecutionState
          : ExStateT extends ExecutionSateType.CONTRACT_AT_EXECUTION_STATE
            ? ContractAtExecutionState
            : ExStateT extends ExecutionSateType.READ_EVENT_ARGUMENT_EXECUTION_STATE
              ? ReadEventArgumentExecutionState
              : never;
