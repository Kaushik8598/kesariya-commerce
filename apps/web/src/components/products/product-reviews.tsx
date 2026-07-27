"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Plus, Loader2, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { reviewService } from "@/services/review.service";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import type { Review, ReviewsResponse } from "@/types/product";

interface ProductReviewsProps {
  slug: string;
}

export function ProductReviews({ slug }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* Modal & Edit/Delete State */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* Form Fields */
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    reviewService
      .getReviews(slug, { limit: 20 })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, [slug]);

  /* Open modal for new review */
  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      toast.error("Please login to write a review");
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setEditingReview(null);
    setRating(5);
    setTitle("");
    setComment("");
    setIsModalOpen(true);
  };

  /* Open modal for editing existing review */
  const handleOpenEditModal = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setTitle(review.title || "");
    setComment(review.comment || "");
    setIsModalOpen(true);
  };

  /* Handle Submit (Create or Update) */
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      return toast.error("Please select a rating from 1 to 5 stars");
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        // Update review
        await reviewService.updateReview(editingReview.id, {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
        });
        toast.success("Review updated successfully!");
      } else {
        // Create new review
        await reviewService.createReview(slug, {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
        });
        toast.success("Review submitted successfully! Thank you for your feedback.");
      }

      setIsModalOpen(false);
      setEditingReview(null);
      setTitle("");
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save review";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* Confirm Delete Review */
  const handleConfirmDelete = async () => {
    if (!deletingReviewId) return;
    setDeleting(true);
    try {
      await reviewService.deleteReview(deletingReviewId);
      toast.success("Review deleted successfully!");
      setDeletingReviewId(null);
      setIsConfirmOpen(false);
      fetchReviews();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete review";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Very Good",
    5: "Excellent!",
  };

  if (loading) {
    return (
      <div id="reviews-section" className="space-y-6 py-10 border-t border-border mt-10">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasReviews = data && data.reviews && data.reviews.length > 0;
  const userReview = data?.reviews?.find((r) => user?.id && (r.userId === user.id || r.user?.id === user.id));

  return (
    <div id="reviews-section" className="py-12 border-t border-border mt-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
            Customer Reviews
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {hasReviews
              ? `Based on ${data.totalReviews} verified customer review${data.totalReviews !== 1 ? "s" : ""}`
              : "No reviews yet. Share your experience with this product."}
          </p>
        </div>
        <Button
          onClick={userReview ? () => handleOpenEditModal(userReview) : handleOpenCreateModal}
          className="gap-2 shrink-0"
        >
          {userReview ? (
            <>
              <Edit2 size={15} /> Edit Your Review
            </>
          ) : (
            <>
              <Plus size={16} /> Write a Review
            </>
          )}
        </Button>
      </div>

      {/* Review Content */}
      {!hasReviews ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <MessageSquare size={26} />
          </div>
          <h4 className="text-lg font-bold text-foreground mb-1">No Reviews Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-6">
            Be the first to review this product and help others make the right choice!
          </p>
          <Button onClick={handleOpenCreateModal} variant="outline" className="gap-2">
            <Star size={14} className="fill-amber-400 text-amber-400" /> Write First Review
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Rating Summary Breakdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-card border border-border">
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/40 rounded-xl min-w-[160px] text-center">
              <span className="text-4xl font-extrabold text-foreground tracking-tight">
                {data.avgRating.toFixed(1)}
              </span>
              <div className="my-2">
                <RatingStars rating={data.avgRating} count={data.totalReviews} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Review{data.totalReviews !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const item = data.ratingBreakdown.find((r) => r.star === star);
                const count = item ? item.count : 0;
                const percentage = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 w-12 shrink-0 font-semibold">
                      <span>{star}</span>
                      <Star className="size-3 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-muted-foreground font-mono">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-6">
            {data.reviews.map((review) => {
              const isOwner =
                user?.id && (review.userId === user.id || review.user?.id === user.id);

              const isEdited =
                review.updatedAt &&
                review.createdAt &&
                new Date(review.updatedAt).getTime() - new Date(review.createdAt).getTime() > 1000;

              return (
                <div
                  key={review.id}
                  className={`p-6 rounded-xl border space-y-3 transition-colors ${
                    isOwner
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : "border-border bg-card/60 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {review.user?.firstName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground">
                            {review.user?.firstName} {review.user?.lastName || ""}
                          </p>
                          {isOwner && (
                            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <RatingStars rating={review.rating} />
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            {isEdited && (
                              <span className="ml-1.5 font-medium text-amber-500/90 dark:text-amber-400 italic">
                                (Edited)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-500/20">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}

                      {/* Owner Edit & Delete Buttons */}
                      {isOwner && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            title="Edit Review"
                            onClick={() => handleOpenEditModal(review)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            title="Delete Review"
                            onClick={() => {
                              setDeletingReviewId(review.id);
                              setIsConfirmOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-bold text-sm text-foreground pt-1">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Create / Edit Review Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReview ? "Edit Your Review" : "Write a Review"}</DialogTitle>
            <DialogDescription>
              {editingReview
                ? "Update your ratings and detailed feedback for this product."
                : "Share your experience with this product to help others."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-5 pt-2">
            {/* Interactive Rating Selector */}
            <div className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-xl border border-border text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Your Rating
              </span>
              <div className="flex items-center gap-1.5 mb-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={
                          active
                            ? "text-amber-400 fill-amber-400 transition-colors"
                            : "text-muted-foreground opacity-40 transition-colors"
                        }
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-primary">
                {ratingLabels[hoverRating || rating]}
              </span>
            </div>

            {/* Review Title */}
            <div className="space-y-1.5">
              <label htmlFor="review-title" className="text-xs font-semibold text-foreground">
                Review Headline (Optional)
              </label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Great fit, superb fabric quality!"
                maxLength={100}
              />
            </div>

            {/* Review Details */}
            <div className="space-y-1.5">
              <label htmlFor="review-comment" className="text-xs font-semibold text-foreground">
                Detailed Review
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about the fit, material, comfort, and how it looks in person..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Saving..." : editingReview ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Review"
        description="Are you sure you want to delete your review? This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete Review"}
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
