import test from "node:test";
import assert from "node:assert/strict";
import { getAdminStats } from "../src/application/use-cases/admin/getAdminStats";
import { updateUserRole } from "../src/application/use-cases/admin/updateUserRole";
import {
  getAdminStatsController,
  updateUserRoleController,
} from "../src/presentation/controllers/adminController";
import { allowRoles, isAdmin, isSuperUser } from "../src/presentation/middleware/roleMiddleware";
import { canAccessAdminStats } from "../src/application/use-cases/forum/postPermissions";
import { UserRepository } from "../src/infrastructure/repositories/UserRepository";
import { PostRepository } from "../src/infrastructure/repositories/PostRepository";
import { CommentRepository } from "../src/infrastructure/repositories/CommentRepository";
import { LikeRepository } from "../src/infrastructure/repositories/LikeRepository";
import { createMockResponse, withPatchedMethod } from "./helpers/testUtils";

test("getAdminStats aggregates totals and derives regular user counts", async () => {
  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "countAll",
    async () => 10,
    async () => {
      await withPatchedMethod(
        UserRepository.prototype as unknown as Record<string, unknown>,
        "countByRole",
        async (role) => {
          if (role === "admin") return 3;
          if (role === "super") return 2;
          return 0;
        },
        async () => {
          await withPatchedMethod(
            PostRepository.prototype as unknown as Record<string, unknown>,
            "countAll",
            async () => 12,
            async () => {
              await withPatchedMethod(
                CommentRepository.prototype as unknown as Record<string, unknown>,
                "countAll",
                async () => 25,
                async () => {
                  await withPatchedMethod(
                    LikeRepository.prototype as unknown as Record<string, unknown>,
                    "countAll",
                    async () => 41,
                    async () => {
                      assert.deepEqual(await getAdminStats(), {
                        users: {
                          total: 10,
                          admins: 3,
                          supers: 2,
                          regularUsers: 5,
                        },
                        content: {
                          posts: 12,
                          comments: 25,
                          likes: 41,
                        },
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

test("updateUserRole returns the updated user and rejects missing users", async () => {
  const updatedUser = {
    id: "user-1",
    username: "casey",
    email: "casey@example.com",
    password: "hash",
    role: "super" as const,
  };

  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "updateRole",
    async () => updatedUser,
    async () => {
      assert.deepEqual(await updateUserRole("user-1", "super"), updatedUser);
    }
  );

  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "updateRole",
    async () => null,
    async () => {
      await assert.rejects(updateUserRole("missing", "admin"), /User not found/);
    }
  );
});

test("updateUserRoleController rejects invalid roles before hitting the repository", async () => {
  const response = createMockResponse();
  await updateUserRoleController(
    {
      params: { userId: "user-1" },
      body: { role: "owner" },
    } as any,
    response as any
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { message: "Invalid role" });
});

test("admin controllers handle unauthorized and missing-user edge cases", async () => {
  const unauthorizedResponse = createMockResponse();
  await getAdminStatsController({} as any, unauthorizedResponse as any);
  assert.equal(unauthorizedResponse.statusCode, 401);
  assert.deepEqual(unauthorizedResponse.body, { message: "Unauthorized" });

  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "updateRole",
    async () => null,
    async () => {
      const missingUserResponse = createMockResponse();
      await updateUserRoleController(
        {
          params: { userId: "missing" },
          body: { role: "admin" },
        } as any,
        missingUserResponse as any
      );

      assert.equal(missingUserResponse.statusCode, 400);
      assert.deepEqual(missingUserResponse.body, { message: "User not found" });
    }
  );
});

test("role middleware only allows the expected roles", () => {
  const nextCalls: string[] = [];
  const next = () => {
    nextCalls.push("next");
  };

  const allowedResponse = createMockResponse();
  isAdmin({ user: { userId: "admin-1", role: "admin" } } as any, allowedResponse as any, next as any);
  assert.deepEqual(nextCalls, ["next"]);

  const deniedResponse = createMockResponse();
  isSuperUser({ user: { userId: "admin-1", role: "admin" } } as any, deniedResponse as any, next as any);
  assert.equal(deniedResponse.statusCode, 403);
  assert.deepEqual(deniedResponse.body, { message: "Access denied" });

  const customGuard = allowRoles(["user"]);
  const noUserResponse = createMockResponse();
  customGuard({} as any, noUserResponse as any, next as any);
  assert.equal(noUserResponse.statusCode, 403);
  assert.deepEqual(noUserResponse.body, { message: "Access denied" });
});

test("canAccessAdminStats only allows admin and super roles", () => {
  assert.equal(canAccessAdminStats("user"), false);
  assert.equal(canAccessAdminStats("admin"), true);
  assert.equal(canAccessAdminStats("super"), true);
});
