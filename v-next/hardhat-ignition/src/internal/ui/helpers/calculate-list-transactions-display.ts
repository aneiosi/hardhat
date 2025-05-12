import type { ListTransactionsResult } from "@nomicfoundation/ignition-core";

import { HardhatError } from "@nomicfoundation/hardhat-errors";

export async function calculateListTransactionsDisplay(
  deploymentId: string,
  listTransactionsResult: ListTransactionsResult,
  configUrl?: string,
): Promise<string> {
  let text = `Logging transactions for deployment ${deploymentId}\n\n`;

  for (const [index, transaction] of listTransactionsResult.entries()) {
    const txLink = getTransactionLink(
      transaction.txHash,
      configUrl ?? transaction.browserUrl,
    );

    text += `Transaction ${index + 1}${txLink === undefined ? "" : txLink}:\n`;
    text += `  - Type: ${transactionTypeToDisplayType(transaction.type)}\n`;
    text += `  - Status: ${transaction.status}\n`;
    text += `  - TxHash: ${transaction.txHash}\n`;
    text += `  - From: ${transaction.from}\n`;

    if (transaction.to !== undefined) {
      text += `  - To: ${transaction.to}\n`;
    }

    if (transaction.name !== undefined) {
      text += `  - Name: ${transaction.name}\n`;
    }

    if (transaction.address !== undefined) {
      text += `  - Address: ${transaction.address}\n`;
    }

    if (transaction.params !== undefined) {
      const {
        default: { stringify },
      } = await import("json5");

      text += `  - Params: ${stringify(
        transaction.params,
        transactionDisplaySerializeReplacer,
      )}\n`;
    }

    if (transaction.value !== undefined) {
      text += `  - Value: '${transaction.value}n'\n`;
    }

    text += "\n";
  }

  return text;
}

function transactionTypeToDisplayType(type: string): string {
  switch (type) {
    case "DEPLOYMENT_EXECUTION_STATE":
      return "Contract Deployment";
    case "CALL_EXECUTION_STATE":
      return "Function Call";
    case "SEND_DATA_EXECUTION_STATE":
      return "Generic Transaction";
    default:
      throw new HardhatError(
        HardhatError.ERRORS.IGNITION.INTERNAL.UNKNOWN_TRANSACTION_TYPE,
        { type },
      );
  }
}

export function transactionDisplaySerializeReplacer(
  _key: string,
  value: unknown,
): unknown {
  if (typeof value === "bigint") {
    return `${value}n`;
  }

  return value;
}

function getTransactionLink(
  txHash: string,
  browserURL?: string,
): string | undefined {
  if (browserURL === undefined) {
    return undefined;
  }

  return `\x1b]8;;${browserURL}/tx/${txHash}\x1b\\ (🔗 view on block explorer)\x1b]8;;\x1b\\`;
}
