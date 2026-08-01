export function applicationServerKeysEqual(
  actualKey: ArrayBuffer | null,
  expectedKey: Uint8Array<ArrayBuffer>,
) {
  if (!actualKey) return false;

  const actualBytes = new Uint8Array(actualKey);
  if (actualBytes.byteLength !== expectedKey.byteLength) return false;

  return actualBytes.every((byte, index) => byte === expectedKey[index]);
}

export async function getPushSubscriptionForKey(
  pushManager: PushManager,
  applicationServerKey: Uint8Array<ArrayBuffer>,
) {
  const existingSubscription = await pushManager.getSubscription();

  if (existingSubscription) {
    if (
      applicationServerKeysEqual(
        existingSubscription.options.applicationServerKey,
        applicationServerKey,
      )
    ) {
      return existingSubscription;
    }

    const unsubscribed = await existingSubscription.unsubscribe();
    if (!unsubscribed) {
      throw new Error(
        "Could not replace the existing push subscription for this origin",
      );
    }
  }

  return pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
}
