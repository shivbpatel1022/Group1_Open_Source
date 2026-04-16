import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerUser } from "../src/application/use-cases/auth/registerUser";
import { loginUser } from "../src/application/use-cases/auth/loginUser";
import {
  createPost,
  deletePost,
  getPostById,
  listPosts,
  updatePost,
} from "../src/application/use-cases/forum/postUseCases";
import { canModifyPost } from "../src/application/use-cases/forum/postPermissions";
import { PostRepository } from "../src/infrastructure/repositories/PostRepository";
import { UserRepository } from "../src/infrastructure/repositories/UserRepository";
import { env } from "../src/config/env";
import { withPatchedMethod } from "./helpers/testUtils";

test("registerUser hashes the password and saves a regular user", async () => {
  const createdUser = {
    id: "user-1",
    username: "maya",
    email: "maya@example.com",
    password: "stored-hash",
    role: "user" as const,
  };

  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "findByEmail",
    async () => null,
    async () => {
      await withPatchedMethod(
        UserRepository.prototype as unknown as Record<string, unknown>,
        "create",
        async (user) => {
          assert.equal(user.role, "user");
          assert.equal(user.email, "maya@example.com");
          assert.notEqual(user.password, "plain-text-secret");
          assert.equal(await bcrypt.compare("plain-text-secret", user.password), true);
          return createdUser;
        },
        async () => {
          const result = await registerUser({
            username: "maya",
            email: "maya@example.com",
            password: "plain-text-secret",
          });

          assert.deepEqual(result, createdUser);
        }
      );
    }
  );
});

test("registerUser rejects duplicate emails", async () => {
  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "findByEmail",
    async () => ({
      id: "existing",
      username: "maya",
      email: "maya@example.com",
      password: "hash",
      role: "user" as const,
    }),
    async () => {
      await assert.rejects(
        registerUser({
          username: "maya",
          email: "maya@example.com",
          password: "plain-text-secret",
        }),
        /Email is already registered/
      );
    }
  );
});

test("loginUser returns a signed token for valid credentials", async () => {
  const password = "correct-horse";
  const hashedPassword = await bcrypt.hash(password, 10);

  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "findByEmail",
    async () => ({
      id: "user-7",
      username: "rowan",
      email: "rowan@example.com",
      password: hashedPassword,
      role: "admin" as const,
    }),
    async () => {
      const result = await loginUser("rowan@example.com", password);
      const decoded = jwt.verify(result.token, env.jwtSecret) as {
        userId: string;
        role: string;
      };

      assert.equal(result.user.email, "rowan@example.com");
      assert.equal(decoded.userId, "user-7");
      assert.equal(decoded.role, "admin");
    }
  );
});

test("loginUser rejects unknown users and invalid passwords", async () => {
  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "findByEmail",
    async () => null,
    async () => {
      await assert.rejects(loginUser("missing@example.com", "secret"), /User not found/);
    }
  );

  const hashedPassword = await bcrypt.hash("right-password", 10);

  await withPatchedMethod(
    UserRepository.prototype as unknown as Record<string, unknown>,
    "findByEmail",
    async () => ({
      id: "user-8",
      username: "kai",
      email: "kai@example.com",
      password: hashedPassword,
      role: "user" as const,
    }),
    async () => {
      await assert.rejects(loginUser("kai@example.com", "wrong-password"), /Invalid password/);
    }
  );
});

test("post use-cases delegate create, list, update, delete, and fetch operations", async () => {
  const createdPost = {
    id: "post-1",
    title: "Hello",
    content: "World",
    authorId: "author-1",
  };

  await withPatchedMethod(
    PostRepository.prototype as unknown as Record<string, unknown>,
    "create",
    async (post) => {
      assert.deepEqual(post, {
        title: "Hello",
        content: "World",
        authorId: "author-1",
      });
      return createdPost;
    },
    async () => {
      assert.deepEqual(await createPost("Hello", "World", "author-1"), createdPost);
    }
  );

  await withPatchedMethod(
    PostRepository.prototype as unknown as Record<string, unknown>,
    "findAll",
    async () => [createdPost],
    async () => {
      assert.deepEqual(await listPosts(), [createdPost]);
    }
  );

  await withPatchedMethod(
    PostRepository.prototype as unknown as Record<string, unknown>,
    "update",
    async (postId, data) => {
      assert.equal(postId, "post-1");
      assert.deepEqual(data, { title: "Updated" });
      return { ...createdPost, title: "Updated" };
    },
    async () => {
      assert.deepEqual(await updatePost("post-1", { title: "Updated" }), {
        ...createdPost,
        title: "Updated",
      });
    }
  );

  await withPatchedMethod(
    PostRepository.prototype as unknown as Record<string, unknown>,
    "delete",
    async (postId) => {
      assert.equal(postId, "post-1");
      return true;
    },
    async () => {
      assert.equal(await deletePost("post-1"), true);
    }
  );

  await withPatchedMethod(
    PostRepository.prototype as unknown as Record<string, unknown>,
    "findById",
    async (postId) => {
      assert.equal(postId, "post-1");
      return createdPost;
    },
    async () => {
      assert.deepEqual(await getPostById("post-1"), createdPost);
    }
  );
});

test("canModifyPost allows authors and super users only", () => {
  const post = {
    id: "post-1",
    title: "Post",
    content: "Content",
    authorId: "author-1",
  };

  assert.equal(canModifyPost({ userId: "author-1", role: "user" }, post), true);
  assert.equal(canModifyPost({ userId: "other-user", role: "admin" }, post), false);
  assert.equal(canModifyPost({ userId: "other-user", role: "super" }, post), true);
});
