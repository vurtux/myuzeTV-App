jest.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
  },
}));

const client = require("../../api/client").default;
const { deleteAccount } = require("../../api/account");

describe("API: account.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("deleteAccount", () => {
    it("calls DELETE /auth/account", async () => {
      client.delete.mockResolvedValue({
        data: { message: "Account deleted successfully" },
      });

      const result = await deleteAccount();
      expect(client.delete).toHaveBeenCalledWith("/auth/account");
      expect(result.message).toBe("Account deleted successfully");
    });

    it("propagates errors", async () => {
      client.delete.mockRejectedValue(new Error("Unauthorized"));

      await expect(deleteAccount()).rejects.toThrow("Unauthorized");
    });
  });
});
