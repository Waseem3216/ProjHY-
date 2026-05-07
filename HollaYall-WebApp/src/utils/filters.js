const urgencyPriority = {
  Low: 1,
  Normal: 2,
  Soon: 3,
  Urgent: 4
};

function includesText(post, query) {
  if (!query.trim()) return true;
  const haystack = [
    post.title,
    post.body,
    post.category,
    post.area,
    ...(post.tags || [])
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function inDateRange(post, dateFrom, dateTo) {
  const created = new Date(post.created_at).getTime();
  if (dateFrom && created < new Date(`${dateFrom}T00:00:00`).getTime()) return false;
  if (dateTo && created > new Date(`${dateTo}T23:59:59`).getTime()) return false;
  return true;
}

function trendingScore(post) {
  const ageHours = Math.max(1, (Date.now() - new Date(post.created_at).getTime()) / 36e5);
  const recencyBoost = 36 / Math.sqrt(ageHours);
  return post.helpful_count * 3 + post.reply_count * 2 + urgencyPriority[post.urgency] * 1.5 + recencyBoost;
}

export function filterAndSortPosts(posts, filters, sortBy) {
  const filtered = posts.filter((post) => {
    if (!includesText(post, filters.search)) return false;
    if (filters.category !== 'All' && post.category !== filters.category) return false;
    if (filters.area !== 'All' && post.area !== filters.area) return false;
    if (filters.urgency !== 'All' && post.urgency !== filters.urgency) return false;
    if (filters.status === 'Solved' && !post.is_solved) return false;
    if (filters.status === 'Open' && post.is_solved) return false;
    if (filters.replyStatus === 'Has replies' && post.reply_count === 0) return false;
    if (filters.replyStatus === 'No replies' && post.reply_count > 0) return false;
    if (filters.tag.trim() && !(post.tags || []).some((tag) => tag.toLowerCase().includes(filters.tag.trim().toLowerCase()))) return false;
    if (!inDateRange(post, filters.dateFrom, filters.dateTo)) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'most-helpful':
        return b.helpful_count - a.helpful_count || new Date(b.created_at) - new Date(a.created_at);
      case 'most-replies':
        return b.reply_count - a.reply_count || new Date(b.created_at) - new Date(a.created_at);
      case 'unanswered-first':
        return a.reply_count - b.reply_count || new Date(b.created_at) - new Date(a.created_at);
      case 'solved-first':
        return Number(b.is_solved) - Number(a.is_solved) || new Date(b.created_at) - new Date(a.created_at);
      case 'urgent-first':
        return urgencyPriority[b.urgency] - urgencyPriority[a.urgency] || new Date(b.created_at) - new Date(a.created_at);
      case 'trending':
        return trendingScore(b) - trendingScore(a);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });
}

export function calculateStats(posts) {
  return {
    questions: posts.length,
    replies: posts.reduce((total, post) => total + (post.reply_count || 0), 0),
    solved: posts.filter((post) => post.is_solved).length,
    helpfulVotes: posts.reduce((total, post) => total + (post.helpful_count || 0), 0)
  };
}
