/**
 * Callback when API returns 401 (token invalid/expired).
 * AuthContext registers here; api client triggers on 401.
 */
let onInvalidCallback = null;

export function onAuthInvalid(callback) {
  onInvalidCallback = callback;
  return () => {
    onInvalidCallback = null;
  };
}

export function triggerAuthInvalid() {
  if (onInvalidCallback) {
    onInvalidCallback();
  }
}
