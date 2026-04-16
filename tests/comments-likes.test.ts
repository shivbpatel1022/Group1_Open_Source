import test from "node:test";
import assert from "node:assert/strict";
import {
  createComment,
  deleteComment,
  getCommentById,
  listCommentsByPost,
  updateComment,
} from "../src/application/use-cases/forum/commentUseCases";
import { toggleLike } from "../src/application/use-cases/forum/likeUseCases";
import {
  createCommentController,
  deleteCommentController,
  updateCommentController,
} from "../src/presentation/controllers/commentController";
import { toggleLikeController } from "../src/presentation/controllers/postController";
import { canModifyComment } from "../src/application/use-cases/forum/postPermissions";
import { CommentRepository } from "../src/infrastructure/repositories/CommentRepository";
import { LikeRepository } from "../src/infrastructure/repositories/LikeRepository";
import { PostRepository } from "../src/infrastructure/repositories/PostRepository";
import { createMockResponse, withPatchedMethod } from "./helpers/testUtils";

test("comment use-cases delegate create, list, update, delete, and fetch operations", async () => {
  const comment = {
    id: "comment-1",
    postId: "post-1",
    content: "First!",
    authorId: "user-1",
  };

  await withPatchedMethod(
    CommentRepository.prototype as unknown as Record<string, unknown>,
    "create",
    async (input) => {
      assert.deepEqual(input, {
        postId: "post-1",
        content: "First!",
        authorId: "user-1",
      });
      return comment;
    },
    async () => {
      assert.deepEqual(await createComment("post-1", "First!", "user-1"), comment);
    }
  );

  await withPatchedMethod(
    CommentRepository.prototype as unknown as Record<string, unknown>,
    "findByPostId",
    async () => [comment],
    async () => {
      assert.deepEqual(await listCommentsByPost("post-1"), [comment]);
    }
  );

  await withPatchedMethod(
    CommentRepository.prototype as unknown as Record<string, unknown>,
    "update",
    async (commentId, content) => {
      assert.equal(commentId, "comment-1");
      assert.equal(content, "Edited");
      return { ...comment, content: "Edited" };
    },
    async () => {
      assert.deepEqual(await updateComment("comment-1", "Edited"), { ...comment, content: "Edited" });
    }
  );

  await withPatchedMethod(
    CommentRepository.prototype as unknown as Record<string, unknown>,
    "delete",
    async () => true,
    async () => {
      assert.equal(await deleteComment("comment-1"), true);
    }
  );

  await withPatchedMethod(
    CommentRepository.prototype as unknown as Record<string, unknown>,
    "findById",
    async () => comment,
    async () => {
      assert.deepEqual(await getCommentById("comment-1"), comment);
    }
  );
});

test("toggleLike creates and removes likes while returning the latest count", async () => {
  const createCalls: Array<{ postId: string; userId: string }> = [];
  const deleteCalls: Array<{ postId: string; userId: string }> = [];

  await withPatchedMethod(
    LikeRepository.prototype as unknown as Record<string, unknown>,
    "exists",
    async () => false,
    async () => {
      await withPatchedMethod(
        LikeRepository.prototype as unknown as Record<string, unknown>,
        "create",
        async (postId, userId) => {
          createCalls.push({ postId, userId });
        },
        async () => {
          await withPatchedMethod(
            LikeRepository.prototype as unknown as Record<string, unknown>,
            "countByPost",
            async () => 3,
            async () => {
              assert.deepEqual(await toggleLike("post-1", "user-1"), {
                liked: true,
                likesCount: 3,
              });
            }
          );
        }
      );
    }
  );

  await withPatchedMethod(
    LikeRepository.prototype as unknown as Record<string, unknown>,
    "exists",
    async () => true,
    async () => {
      await withPatchedMethod(
        LikeRepository.prototype as unknown as Record<string, unknown>,
        "delete",
        async (postId, userId) => {
          deleteCalls.push({ postId, userId });
        },
        async () => {
          await withPatchedMethod(
            LikeRepository.prototype as unknown as Record<string, unknown>,
            "countByPost",
            async () => 2,
            async () => {
              assert.deepEqual(await toggleLike("post-1", "user-1"), {
                liked: false,
                likesCount: 2,
              });
            }
          );
        }
      );
    }
  );

  assert.deepEqual(createCalls, [{ postId: "post-1", userId: "user-1" }]);
  assert.deepEqual(deleteCalls, [{ postId: "post-1", userId: "user-1" }]);
});

test("canModifyComment honors super users, authors, and post owners with elevated roles", () => {
  assert.equal(canModifyComment({ userId: "super-1", role: "super" }, "author-1", "owner-1"), true);
  assert.equal(canModifyComment({ userId: "author-1", role: "user" }, "author-1", "owner-1"), true);
  assert.equal(canModifyComment({ userId: "owner-1", role: "admin" }, "author-1", "owner-1"), true);
  assert.equal(canModifyComment({ userId: "owner-1", role: "user" }, "author-1", "owner-1"), false);
  assert.equal(canModifyComment({ userId: "outsider", role: "admin" }, "author-1", "owner-1"), false);
});

test("comment controllers reject unauthorized users and missing resources", async () => {
  const unauthorizedResponse = createMockResponse();
  await createCommentController({ params: { postId: "post-1" } } as any, unauthorizedResponse as any);
  assert.equal(unauthorizedResponse.statusCode, 401);
  assert.deepEqual(unauthorizedResponse.body, { message: "Unauthorized" });

  await withPatchedMethod(
    PostRepository.prototype as unknown as Record<string, unknown>,
    "findById",
    async () => null,
    async () => {
      const missingPostResponse = createMockResponse();
      await createCommentController(
        {
          params: { postId: "post-404" },
          body: { content: "Hi" },
          user: { userId: "user-1", role: "user" },
        } as any,
        missingPostResponse as any
      );

      assert.equal(missingPostResponse.statusCode, 404);
      assert.deepEqual(missingPostResponse.body, { message: "Post not found" });
    }
  );

  await withPatchedMethod(
    CommentRepository.prototype as unknown as Record<string, unknown>,
    "findById",
    async () => null,
    async () => {
      const missingCommentResponse = createMockResponse();
      await updateCommentController(
        {
          params: { commentId: "comment-404" },
          body: { content: "Edit" },
          user: { userId: "user-1", role: "user" },
        } as any,
        missingCommentResponse as any
      );

      assert.equal(missingCommentResponse.statusCode, 404);
      assert.deepEqual(missingCommentResponse.body, { message: "Comment not found" });
    }
  );
});

test("comment controllers block unauthorized edits and deletes", async () => {
  await withPatchedMethod(
    CommentRepository.prototype as unknown as Record<string, unknown>,
    "findById",
    async () => ({
      id: "comment-1",
      postId: "post-1",
      content: "Hello",
      authorId: "author-1",
    }),
    async () => {
      const updateResponse = createMockResponse();
      await updateCommentController(
        {
          params: { commentId: "comment-1" },
          body: { content: "Edit" },
          user: { userId: "other-user", role: "admin" },
        } as any,
        updateResponse as any
      );

      assert.equal(updateResponse.statusCode, 403);
      assert.deepEqual(updateResponse.body, { message: "You cannot modify this comment" });

      const deleteResponse = createMockResponse();
      await deleteCommentController(
        {
          params: { commentId: "comment-1" },
          user: { userId: "other-user", role: "user" },
        } as any,
        deleteResponse as any
      );

      assert.equal(deleteResponse.statusCode, 403);
      assert.deepEqual(deleteResponse.body, { message: "You cannot delete this comment" });
    }
  );
});

test("toggleLikeController validates auth and post existence", async () => {
  const unauthorizedResponse = createMockResponse();
  await toggleLikeController({ params: { postId: "post-1" } } as any, unauthorizedResponse as any);
  assert.equal(unauthorizedResponse.statusCode, 401);
  assert.deepEqual(unauthorizedResponse.body, { message: "Unauthorized" });

  await withPatchedMethod(
    PostRepository.prototype as unknown as Record<string, unknown>,
    "findById",
    async () => null,
    async () => {
      const missingPostResponse = createMockResponse();
      await toggleLikeController(
        {
          params: { postId: "post-404" },
          user: { userId: "user-1", role: "user" },
        } as any,
        missingPostResponse as any
      );

      assert.equal(missingPostResponse.statusCode, 404);
      assert.deepEqual(missingPostResponse.body, { message: "Post not found" });
    }
  );
});
