import { prisma } from "../../../infrastructure/database/lib/prisma.js";

export class CompanyReviewService {
  async getCompanyReviews(companyId: string) {
    const reviews = await prisma.companyReview.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = reviews.length;
    const averageRating =
      total > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
        : 0;

    return {
      averageRating,
      totalReviews: total,
      reviews: reviews.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        userId: r.userId,
        userName: r.user.fullName,
        rating: r.rating,
        title: r.title,
        review: r.review,
        createdAt: r.createdAt,
      })),
    };
  }

  async createCompanyReview(data: {
    companyId: string;
    userId: string;
    rating: number;
    title?: string;
    review: string;
  }) {
    const existing = await prisma.companyReview.findUnique({
      where: {
        companyId_userId: {
          companyId: data.companyId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      throw new Error("You have already submitted a review for this company.");
    }

    const newReview = await prisma.companyReview.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        rating: Math.min(5, Math.max(1, data.rating)),
        title: data.title,
        review: data.review,
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return {
      id: newReview.id,
      companyId: newReview.companyId,
      userId: newReview.userId,
      userName: newReview.user.fullName,
      rating: newReview.rating,
      title: newReview.title,
      review: newReview.review,
      createdAt: newReview.createdAt,
    };
  }
}
