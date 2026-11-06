import * as Network from "expo-network";

export class OfflineMutationError extends Error {
  constructor() {
    super(
      "This action requires an internet connection. " +
      "Reconnect and try again."
    );

    this.name = "OfflineMutationError";
  }
}

export async function assertOnline(): Promise<void> {
  const state = await Network.getNetworkStateAsync();

  const online =
    state.isConnected === true &&
    state.isInternetReachable !== false;

  if (!online) {
    throw new OfflineMutationError();
  }
}

/**
 * Use this before every operation that changes backend data.
 *
 * Examples:
 * - Recording attendance
 * - Entering marks
 * - Making or recording payments
 * - Submitting assignments
 * - Borrowing or returning library books
 */
export async function runOnlineOnly<T>(
  operation: () => Promise<T>
): Promise<T> {
  await assertOnline();
  return operation();
}