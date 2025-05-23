import type { Event, Exception, StackFrame, Stacktrace } from "@sentry/node";

import * as path from "node:path";

import {
  findClosestPackageJson,
  PackageJsonNotFoundError,
} from "@nomicfoundation/hardhat-utils/package";
// This file is executed in a subprocess, and it is always run in this context.
// Therefore, it is acceptable to avoid using dynamic imports and instead import all necessary modules at the beginning.
import * as czech from "ethereum-cryptography/bip39/wordlists/czech.js";
import * as english from "ethereum-cryptography/bip39/wordlists/english.js";
import * as french from "ethereum-cryptography/bip39/wordlists/french.js";
import * as italian from "ethereum-cryptography/bip39/wordlists/italian.js";
import * as japanese from "ethereum-cryptography/bip39/wordlists/japanese.js";
import * as korean from "ethereum-cryptography/bip39/wordlists/korean.js";
import * as simplifiedChinese from "ethereum-cryptography/bip39/wordlists/simplified-chinese.js";
import * as SPANISH from "ethereum-cryptography/bip39/wordlists/spanish.js";
import * as traditionalChinese from "ethereum-cryptography/bip39/wordlists/traditional-chinese.js";

interface WordMatch {
  index: number;
  word: string;
}

export type AnonymizeResult =
  | { success: true; event: Event }
  | { success: false; error: string };

const ANONYMIZED_FILE = "<user-file>";
const ANONYMIZED_MNEMONIC = "<mnemonic>";
const MNEMONIC_PHRASE_LENGTH_THRESHOLD = 7;
const MINIMUM_AMOUNT_OF_WORDS_TO_ANONYMIZE = 4;

export class Anonymizer {
  readonly #configPath?: string;

  constructor(configPath?: string) {
    this.#configPath = configPath;
  }

  /**
   * Given a sentry serialized exception
   * (https://develop.sentry.dev/sdk/event-payloads/exception/), return an
   * anonymized version of the event.
   */
  public async anonymize(event: any): Promise<AnonymizeResult> {
    if (event === null || event === undefined) {
      return { success: false, error: "event is null or undefined" };
    }
    if (typeof event !== "object") {
      return { success: false, error: "event is not an object" };
    }

    const result: Event = {
      event_id: event.event_id,
      platform: event.platform,
      timestamp: event.timestamp,
      extra: event.extra,
    };

    if (event.exception !== undefined && event.exception.values !== undefined) {
      const anonymizedExceptions = await this.#anonymizeExceptions(
        event.exception.values,
      );
      result.exception = {
        values: anonymizedExceptions,
      };
    }

    return { success: true, event: result };
  }

  /**
   * Return the anonymized filename and a boolean indicating if the content of
   * the file should be anonymized
   */
  public async anonymizeFilename(filename: string): Promise<{
    anonymizedFilename: string;
    anonymizeContent: boolean;
  }> {
    if (filename === this.#configPath) {
      const packageJsonPath = await this._getFilePackageJsonPath(filename);

      if (packageJsonPath === null) {
        // if we can't find a package.json, we just return the basename
        return {
          anonymizedFilename: path.basename(filename),
          anonymizeContent: true,
        };
      }

      return {
        anonymizedFilename: path.relative(
          path.dirname(packageJsonPath),
          filename,
        ),
        anonymizeContent: true,
      };
    }

    const parts = filename.split(path.sep);
    const nodeModulesIndex = parts.indexOf("node_modules");

    if (nodeModulesIndex === -1) {
      if (filename.startsWith("internal")) {
        // show internal parts of the stack trace
        return {
          anonymizedFilename: filename,
          anonymizeContent: false,
        };
      }

      // if the file isn't inside node_modules and it's a user file, we hide it completely
      return {
        anonymizedFilename: ANONYMIZED_FILE,
        anonymizeContent: true,
      };
    }

    return {
      anonymizedFilename: parts.slice(nodeModulesIndex).join(path.sep),
      anonymizeContent: false,
    };
  }

  public anonymizeErrorMessage(errorMessage: string): string {
    errorMessage = this.#anonymizeMnemonic(errorMessage);

    // Match path separators both for Windows and Unix
    const pathRegex = /\S+[\/\\]\S+/g;

    // for files that don't have a path separator
    const fileRegex = new RegExp("\\S+\\.(js|ts)\\S*", "g");

    // hide hex strings of 20 chars or more
    const hexRegex = /(0x)?[0-9A-Fa-f]{20,}/g;

    return errorMessage
      .replace(pathRegex, ANONYMIZED_FILE)
      .replace(fileRegex, ANONYMIZED_FILE)
      .replace(hexRegex, (match) => match.replace(/./g, "x"));
  }

  public raisedByHardhat(event: Event): boolean {
    const exceptions = event?.exception?.values;

    if (exceptions === undefined) {
      // if we can't prove that the exception doesn't come from hardhat,
      // we err on the side of reporting the error
      return true;
    }

    const originalException = exceptions[exceptions.length - 1];

    const frames = originalException?.stacktrace?.frames;

    if (frames === undefined) {
      return true;
    }

    for (const frame of frames.slice().reverse()) {
      if (frame.filename === undefined) {
        continue;
      }

      if (this.#errorRaisedByPackageToIgnore(frame.filename)) {
        return false;
      }

      // we stop after finding either a hardhat file or a file from the user's
      // project
      if (this.#isHardhatFile(frame.filename)) {
        return true;
      }

      if (frame.filename === ANONYMIZED_FILE) {
        return false;
      }

      if (
        this.#configPath !== undefined &&
        this.#configPath.includes(frame.filename)
      ) {
        return false;
      }
    }

    // if we didn't find any hardhat frame, we don't report the error
    return false;
  }

  protected async _getFilePackageJsonPath(
    filename: string,
  ): Promise<string | null> {
    try {
      return await findClosestPackageJson(filename);
    } catch (err) {
      if (err instanceof PackageJsonNotFoundError) {
        return null;
      }

      throw err;
    }
  }

  #errorRaisedByPackageToIgnore(filename: string): boolean {
    const pkgsToIgnore: string[] = [
      path.join("node_modules", "@ethersproject"), // List of external packages that we don't want to report errors from
    ];

    const pkgs = filename.match(/node_modules[\/\\][^\/\\]+/g); // Match path separators both for Windows and Unix

    if (pkgs === null) {
      return false;
    }

    const errorSourcePkg = pkgs[pkgs.length - 1];

    return pkgsToIgnore.includes(errorSourcePkg);
  }

  #isHardhatFile(filename: string): boolean {
    const nomicFoundationPath = path.join("node_modules", "@nomicfoundation");
    const ignoredOrgPath = path.join("node_modules", "@ignored");
    const hardhatPath = path.join("node_modules", "hardhat");
    filename = filename.toLowerCase();

    return (
      filename.startsWith(nomicFoundationPath) ||
      filename.startsWith(ignoredOrgPath) ||
      filename.startsWith(hardhatPath)
    );
  }

  async #anonymizeExceptions(exceptions: Exception[]): Promise<Exception[]> {
    const anonymizedExceptions = await Promise.all(
      exceptions.map((exception) => this.#anonymizeException(exception)),
    );
    return anonymizedExceptions;
  }

  async #anonymizeException(value: Exception): Promise<Exception> {
    const result: Exception = {
      type: value.type,
    };

    if (value.value !== undefined) {
      result.value = this.anonymizeErrorMessage(value.value);
    }

    if (value.stacktrace !== undefined) {
      result.stacktrace = await this.#anonymizeStacktrace(value.stacktrace);
    }

    return result;
  }

  async #anonymizeStacktrace(stacktrace: Stacktrace): Promise<Stacktrace> {
    if (stacktrace.frames !== undefined) {
      const anonymizedFrames = await this.#anonymizeFrames(stacktrace.frames);
      return {
        frames: anonymizedFrames,
      };
    }

    return {};
  }

  async #anonymizeFrames(frames: StackFrame[]): Promise<StackFrame[]> {
    const anonymizedFrames = await Promise.all(
      frames.map(async (frame) => {
        return this.#anonymizeFrame(frame);
      }),
    );
    return anonymizedFrames;
  }

  async #anonymizeFrame(frame: StackFrame): Promise<StackFrame> {
    const result: StackFrame = {
      lineno: frame.lineno,
      colno: frame.colno,
      function: frame.function,
    };

    let anonymizeContent = true;
    if (frame.filename !== undefined) {
      const anonymizationResult = await this.anonymizeFilename(frame.filename);
      result.filename = anonymizationResult.anonymizedFilename;
      anonymizeContent = anonymizationResult.anonymizeContent;
    }

    if (!anonymizeContent) {
      result.context_line = frame.context_line;
      result.pre_context = frame.pre_context;
      result.post_context = frame.post_context;
      result.vars = frame.vars;
    }

    return result;
  }

  #anonymizeMnemonic(errorMessage: string): string {
    const matches = getAllWordMatches(errorMessage);

    // If there are enough consecutive words, there's a good chance of there being a mnemonic phrase
    if (matches.length < MNEMONIC_PHRASE_LENGTH_THRESHOLD) {
      return errorMessage;
    }

    const mnemonicWordList = [
      czech,
      english,
      french,
      italian,
      japanese,
      korean,
      simplifiedChinese,
      SPANISH,
      traditionalChinese,
    ]
      .map((wordlistModule) => wordlistModule.wordlist)
      .flat();

    let anonymizedMessage = errorMessage.slice(0, matches[0].index);

    // Determine all mnemonic phrase maximal fragments.
    // We check sequences of n consecutive words just in case there is a typo
    let wordIndex = 0;
    while (wordIndex < matches.length) {
      const maximalPhrase = getMaximalMnemonicPhrase(
        matches,
        errorMessage,
        wordIndex,
        mnemonicWordList,
      );

      if (maximalPhrase.length >= MINIMUM_AMOUNT_OF_WORDS_TO_ANONYMIZE) {
        const lastAnonymizedWord = maximalPhrase[maximalPhrase.length - 1];
        const nextWordIndex =
          wordIndex + maximalPhrase.length < matches.length
            ? matches[wordIndex + maximalPhrase.length].index
            : errorMessage.length;
        const sliceUntilNextWord = errorMessage.slice(
          lastAnonymizedWord.index + lastAnonymizedWord.word.length,
          nextWordIndex,
        );
        anonymizedMessage += `${ANONYMIZED_MNEMONIC}${sliceUntilNextWord}`;
        wordIndex += maximalPhrase.length;
      } else {
        const thisWord = matches[wordIndex];
        const nextWordIndex =
          wordIndex + 1 < matches.length
            ? matches[wordIndex + 1].index
            : errorMessage.length;
        const sliceUntilNextWord = errorMessage.slice(
          thisWord.index,
          nextWordIndex,
        );
        anonymizedMessage += sliceUntilNextWord;
        wordIndex++;
      }
    }

    return anonymizedMessage;
  }
}

function getMaximalMnemonicPhrase(
  matches: WordMatch[],
  originalMessage: string,
  startIndex: number,
  mnemonicWordList: string[],
): WordMatch[] {
  const maximalPhrase: WordMatch[] = [];
  for (let i = startIndex; i < matches.length; i++) {
    const thisMatch = matches[i];
    if (!mnemonicWordList.includes(thisMatch.word)) {
      break;
    }

    if (maximalPhrase.length > 0) {
      // Check that there's only whitespace until this word.
      const lastMatch = maximalPhrase[maximalPhrase.length - 1];
      const lastIndex = lastMatch.index + lastMatch.word.length;
      const sliceBetweenWords = originalMessage.slice(
        lastIndex,
        thisMatch.index,
      );
      if (!/\s+/u.test(sliceBetweenWords)) {
        break;
      }
    }

    maximalPhrase.push(thisMatch);
  }
  return maximalPhrase;
}

function getAllWordMatches(errorMessage: string) {
  const matches: WordMatch[] = [];
  const re = /\p{Letter}+/gu;
  let match = re.exec(errorMessage);
  while (match !== null) {
    matches.push({
      word: match[0],
      index: match.index,
    });
    match = re.exec(errorMessage);
  }
  return matches;
}
