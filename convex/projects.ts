import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = verifyAuth(ctx);

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: (await identity).subject,
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

export const getPartial = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = verifyAuth(ctx);

    const user = await identity;
    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.subject))
      .order("desc")
      .take(args.limit ?? 10);
  },
});
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = verifyAuth(ctx);

    const user = await identity;
    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user.subject))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = verifyAuth(ctx);

    const project = await ctx.db.get("projects", args.id);

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== (await identity).subject) {
      throw new Error("Unauthorized access to this project");
    }

    return project;
  },
});

export const rename = mutation({
  args: {
    id: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = verifyAuth(ctx);

    const project = await ctx.db.get("projects", args.id);

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== (await identity).subject) {
      throw new Error("Unauthorized access to this project");
    }

    await ctx.db.patch("projects", args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});
