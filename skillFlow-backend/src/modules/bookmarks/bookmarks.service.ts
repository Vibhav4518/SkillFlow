import { prisma } from "../../infrastructure/database/db.client.js";

export const bookmarksService = {
  async getUserBookmarks(userId: string, role?: string) {
    const normalizedRole = (role || "").toUpperCase();

    if (normalizedRole === "EMPLOYER") {
      // Return bookmarked candidate applications
      const bookmarks = await prisma.bookmark.findMany({
        where: {
          userId,
          type: "APPLICATION",
        },
        include: {
          application: {
            include: {
              job: true,
              candidate: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                    },
                  },
                  skills: {
                    include: { skill: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return bookmarks;
    }

    // Default / Candidate: Return bookmarked jobs
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        type: "JOB",
      },
      include: {
        job: {
          include: {
            company: true,
            skills: {
              include: { skill: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return bookmarks;
  },

  async toggleBookmark(userId: string, payload: { jobId?: string; applicationId?: string; type?: "JOB" | "APPLICATION" }) {
    const { jobId, applicationId } = payload;
    let type = payload.type;

    if (jobId) {
      type = "JOB";
      const existing = await prisma.bookmark.findFirst({
        where: { userId, jobId },
      });

      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false, message: "Job removed from bookmarks" };
      } else {
        const created = await prisma.bookmark.create({
          data: {
            userId,
            jobId,
            type,
          },
        });
        return { bookmarked: true, bookmark: created, message: "Job added to bookmarks" };
      }
    }

    if (applicationId) {
      type = "APPLICATION";
      const existing = await prisma.bookmark.findFirst({
        where: { userId, applicationId },
      });

      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false, message: "Application removed from bookmarks" };
      } else {
        const created = await prisma.bookmark.create({
          data: {
            userId,
            applicationId,
            type,
          },
        });
        return { bookmarked: true, bookmark: created, message: "Application added to bookmarks" };
      }
    }

    throw new Error("Either jobId or applicationId is required");
  },

  async checkBookmarkStatus(userId: string, query: { jobId?: string; applicationId?: string }) {
    const { jobId, applicationId } = query;
    if (jobId) {
      const b = await prisma.bookmark.findFirst({ where: { userId, jobId } });
      return { bookmarked: Boolean(b), bookmarkId: b?.id };
    }
    if (applicationId) {
      const b = await prisma.bookmark.findFirst({ where: { userId, applicationId } });
      return { bookmarked: Boolean(b), bookmarkId: b?.id };
    }
    return { bookmarked: false };
  },

  async deleteBookmark(userId: string, bookmarkId: string) {
    return prisma.bookmark.deleteMany({
      where: { id: bookmarkId, userId },
    });
  },
};
