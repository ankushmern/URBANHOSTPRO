import React, { useState, useEffect } from 'react';
import { ReviewItem, UserProfile } from '../types';

interface ReviewsSectionProps {
  userProfile?: UserProfile | null;
  dishId?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ userProfile, dishId }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(4.9);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [dishId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url = dishId ? `/api/v1/reviews?dishId=${dishId}` : '/api/v1/reviews';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        if (data.averageRating) setAverageRating(data.averageRating);
      }
    } catch (e) {
      console.warn('Could not fetch reviews', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter your review text.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
          dishId: dishId || '',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Thank you! Your review has been published.');
        setComment('');
        setIsWriting(false);
        fetchReviews();
      } else {
        showToast(data.message || 'Failed to submit review');
      }
    } catch (err: any) {
      showToast('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const res = await fetch(`/api/v1/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review deleted.');
        fetchReviews();
      }
    } catch (e) {
      showToast('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs shadow-xl border border-amber-500/30">
          {toastMsg}
        </div>
      )}

      {/* Header & Average Score */}
      <div className="bg-white dark:bg-[#161618] p-6 rounded-3xl border border-zinc-200 dark:border-[#2D2D30] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 text-amber-500 flex flex-col items-center justify-center font-extrabold border border-amber-500/20">
            <span className="text-3xl font-black">{averageRating}</span>
            <div className="flex text-amber-400 text-[10px] mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <i key={s} className="fas fa-star"></i>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg sm:text-xl">
              Customer Reviews & Ratings
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Based on {reviews.length} verified culinary experiences and private chef bookings.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <i className="fas fa-check-circle"></i> 100% Verified Customer Reviews
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsWriting(!isWriting)}
          className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold px-5 py-3 rounded-2xl text-xs transition shadow-md cursor-pointer flex items-center gap-2 active:scale-98"
        >
          <i className={`fas ${isWriting ? 'fa-times' : 'fa-pen'}`}></i>
          <span>{isWriting ? 'Cancel Review' : 'Write a Verified Review'}</span>
        </button>
      </div>

      {/* Write Review Form */}
      {isWriting && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white dark:bg-[#161618] p-6 rounded-3xl border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <i className="fas fa-star text-amber-500"></i> Share Your Culinary Experience
          </h4>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition cursor-pointer ${
                    rating >= star
                      ? 'bg-amber-500 text-gray-950 shadow-xs scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {star} <i className="fas fa-star text-[10px] ml-0.5"></i>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Your Feedback & Review Comments
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the food taste, chef hygiene, punctuality, and overall presentation..."
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            <span>Publish Review</span>
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">
          <i className="fas fa-spinner fa-spin text-amber-500 text-xl mb-2"></i>
          <p>Loading customer reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#161618] rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6">
          <p className="font-bold text-sm text-gray-900 dark:text-white">No Reviews Yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Be the first verified customer to leave feedback!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => {
            const revId = rev._id || rev.id || '';
            const isOwner = userProfile && (userProfile._id === rev.userId || userProfile.role === 'admin');

            return (
              <div
                key={revId}
                className="p-5 rounded-3xl bg-white dark:bg-[#161618] border border-zinc-200 dark:border-[#2D2D30] space-y-3 flex flex-col justify-between shadow-xs hover:border-amber-500/30 transition"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        className="w-10 h-10 rounded-full object-cover border border-amber-400"
                        alt={rev.userName}
                      />
                      <div>
                        <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{rev.userName}</h4>
                        {rev.isVerifiedCustomer && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <i className="fas fa-shield-alt"></i> Verified Customer
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex text-amber-400 text-xs">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fas fa-star ${star <= rev.rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}
                        ></i>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                  <span>
                    {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  {isOwner && (
                    <button
                      onClick={() => handleDeleteReview(revId)}
                      className="text-rose-500 hover:underline font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
