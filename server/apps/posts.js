import { Router } from "express";
import { pool } from "../utils/db.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const title = req.query.title || "";
  const tag = req.query.tag || "";

  let query = "";
  let values = [];

  if (title && tag) {
    query = `select * from posts
    where title=$1
    and tag $2
   `;
    values = [title, tag];
  } else if (title) {
    query = `select * from posts
    where title ilike $1
    `;
    values = [title];
  } else if (tag) {
    query = `select * from posts
    where tag=$1
    `;
    values = [tag];
  } else {
    query = `select * from posts
    `;
    values = [];
  }

  const results = await pool.query(query, values);

  return res.json({
    data: results.rows,
  });
});

postRouter.get("/:id", async (req, res) => {
  const postId = req.params.id;

  const result = await pool.query("select * from posts where post_id=$1", [
    postId,
  ]);

  return res.json({
    data: result.rows,
  });
});

postRouter.post("/", async (req, res) => {
  const newPost = {
    ...req.body,
  };

  await pool.query(
    `
  insert into posts(user_id,title,content,likes,tag)
  values($1,$2,$3,$4,$5)`,
    [
      newPost.user_id,
      newPost.title,
      newPost.content,
      newPost.likes,
      newPost.tag,
    ]
  );
  return res.json({
    message: "Post has been created.",
  });
});

postRouter.post("/:id/comments", async (req, res) => {
  const postId = req.params.id;
  const newComment = {
    ...req.body,
  };

  await pool.query(
    `
  insert into comments(user_id,post_id,content,likes,tag)
  values($1,$2,$3,$4,$5)`,
    [newComment.user_id,postId, newComment.content, newComment.likes, newComment.tag]
  );
  return res.json({
    message: "Comment has been created.",
  });
});

postRouter.put("/:id", async (req, res) => {
  const updatedPost = {
    ...req.body,
  };

  const postId = req.params.id;
  await pool.query(
    `update posts set title=$1,content=$2
    where post_id=$3
    `,
    [updatedPost.title,updatedPost.content, postId]
  );

  return res.json({
    message: `Post ${postId} has been updated.`,
  });
});

postRouter.put("/comments/:id", async (req, res) => {
  const updatedcomment = {
    ...req.body,
  };

  const commentId = req.params.id;
  await pool.query(
    `update comments set content=$1
    where comment_id=$2
    `,
    [updatedcomment.content, commentId]
  );

  return res.json({
    message: `comment ${commentId} has been updated.`,
  });
});

postRouter.delete("/:id", async (req, res) => {
  const postId = req.params.id;

  await pool.query(`delete from posts where post_id=$1`, [postId]);

  return res.json({
    message: `Post ${postId} has been deleted.`,
  });
});

postRouter.delete("/comments/:id", async (req, res) => {
  const commentId = req.params.id;

  await pool.query(`delete from comments where comment_id=$1`, [commentId]);

  return res.json({
    message: `comment ${commentId} has been deleted.`,
  });
});

export default postRouter;
