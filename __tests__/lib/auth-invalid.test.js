describe("lib/auth-invalid.js", () => {
  let onAuthInvalid;
  let triggerAuthInvalid;

  beforeEach(() => {
    // Reset module state between tests so callbacks don't leak
    jest.resetModules();
    const authInvalid = require("../../lib/auth-invalid");
    onAuthInvalid = authInvalid.onAuthInvalid;
    triggerAuthInvalid = authInvalid.triggerAuthInvalid;
  });

  // ---------------------------------------------------------------------------
  // onAuthInvalid
  // ---------------------------------------------------------------------------
  describe("onAuthInvalid", () => {
    it("registers a callback that gets called on trigger", () => {
      const callback = jest.fn();

      onAuthInvalid(callback);
      triggerAuthInvalid();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("returns an unsubscribe function", () => {
      const callback = jest.fn();

      const unsubscribe = onAuthInvalid(callback);
      expect(typeof unsubscribe).toBe("function");
    });

    it("unsubscribe prevents future triggers from calling callback", () => {
      const callback = jest.fn();

      const unsubscribe = onAuthInvalid(callback);
      unsubscribe();
      triggerAuthInvalid();

      expect(callback).not.toHaveBeenCalled();
    });

    it("replaces previous callback when called again", () => {
      const first = jest.fn();
      const second = jest.fn();

      onAuthInvalid(first);
      onAuthInvalid(second);
      triggerAuthInvalid();

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // triggerAuthInvalid
  // ---------------------------------------------------------------------------
  describe("triggerAuthInvalid", () => {
    it("does not throw when no callback is registered", () => {
      expect(() => triggerAuthInvalid()).not.toThrow();
    });

    it("calls the registered callback", () => {
      const callback = jest.fn();
      onAuthInvalid(callback);

      triggerAuthInvalid();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("can be triggered multiple times", () => {
      const callback = jest.fn();
      onAuthInvalid(callback);

      triggerAuthInvalid();
      triggerAuthInvalid();
      triggerAuthInvalid();

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("does not call callback after unsubscribe", () => {
      const callback = jest.fn();
      const unsubscribe = onAuthInvalid(callback);

      triggerAuthInvalid();
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      triggerAuthInvalid();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
