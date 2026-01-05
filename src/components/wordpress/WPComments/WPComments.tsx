'use client';

import React, { useState, useEffect } from 'react';

interface Comment {
    id: number;
    author_name: string;
    date: string;
    content: {
        rendered: string;
    };
}

interface WPCommentsProps {
    postId: number;
}

const WPComments: React.FC<WPCommentsProps> = ({ postId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Form State
    const [authorName, setAuthorName] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (!postId) return;

        const fetchComments = async () => {
            try {
                // Now that `show_in_rest` is enabled, we can use the proper API!
                // Use robust URL pattern to bypass rewrite rules
                const res = await fetch(`https://4seasonswharton.com/index.php?rest_route=/wp/v2/comments&post=${postId}`);
                if (!res.ok) throw new Error('Failed to fetch comments');
                const data = await res.json();
                setComments(data);
            } catch (err) {
                console.error('Error loading comments:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Use robust URL pattern for POST as well
            const res = await fetch('https://4seasonswharton.com/index.php?rest_route=/wp/v2/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post: postId,
                    author_name: authorName,
                    author_email: authorEmail,
                    content: commentContent,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();

                // Specific Check for "Cannot Read Post" (Custom Post Type REST visibility issue)
                if (errorData.code === 'rest_cannot_read_post') {
                    throw new Error('Server Error: This "Event" post type is hidden from the API. Please ask the admin to enable "show_in_rest" for Events or checking permissions.');
                }

                // Check for Auth (Guest Comments)
                if (res.status === 401 || errorData.code === 'rest_comment_login_required') {
                    throw new Error('Guest comments are disabled in the API. Please add the "rest_allow_anonymous_comments" filter to your WordPress site.');
                }

                throw new Error(errorData.message || 'Failed to post comment');
            }

            // Success
            setSubmitStatus('success');
            setStatusMessage('Comment submitted! It may require approval before appearing.');
            setAuthorName('');
            setAuthorEmail('');
            setCommentContent('');

            // Optionally, refresh comments if the API returns the approved comment immediately
            // But usually, it returns "pending", so we just show the success message.

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setSubmitStatus('error');
            setStatusMessage(`Error: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-stone-400 text-sm">Loading discussion...</div>;
    // We don't hide the component on error, just the list, so they can still try to post or see the form

    return (
        <div className="mt-8 border-t border-stone-100 pt-6">
            <h4 className="text-lg font-serif text-stone-800 mb-6">Comments ({comments.length})</h4>

            {/* List */}
            <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                    <p className="text-stone-500 italic text-sm">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-stone-900 text-sm">{comment.author_name}</span>
                                <span className="text-xs text-stone-400">
                                    {new Date(comment.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div
                                className="text-stone-600 text-sm prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
                <h5 className="text-md font-bold text-stone-800 mb-4">Leave a Reply</h5>

                {submitStatus === 'success' && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                        {statusMessage}
                    </div>
                )}
                {submitStatus === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`name-${postId}`} className="block text-xs font-semibold text-stone-500 uppercase mb-1">Name</label>
                            <input
                                id={`name-${postId}`}
                                type="text"
                                required
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors text-sm"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label htmlFor={`email-${postId}`} className="block text-xs font-semibold text-stone-500 uppercase mb-1">Email</label>
                            <input
                                id={`email-${postId}`}
                                type="email"
                                required
                                value={authorEmail}
                                onChange={(e) => setAuthorEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors text-sm"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor={`comment-${postId}`} className="block text-xs font-semibold text-stone-500 uppercase mb-1">Comment</label>
                        <textarea
                            id={`comment-${postId}`}
                            rows={3}
                            required
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors text-sm"
                            placeholder="Write your thoughts..."
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WPComments;
