import { demoPosts, demoReplies } from '../data/demoData';
import { getAnonymousProfile } from './anonymousIdentity';
import { isSupabaseConfigured, supabase } from './supabase';

let demoState = {
  posts: demoPosts.map((post) => ({ ...post })),
  replies: demoReplies.map((reply) => ({ ...reply })),
  helpfulVotes: [],
  reports: []
};

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function requireSupabaseAuth(profile) {
  if (!profile.isAuthenticated) {
    throw new Error(profile.authError || 'Anonymous auth is not available. Enable anonymous sign-ins in Supabase or use demo mode without env vars.');
  }
}

async function getMyVoteSet(targetIds = []) {
  const profile = await getAnonymousProfile();
  if (!isSupabaseConfigured || !supabase || !profile.isAuthenticated || targetIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from('helpful_votes')
    .select('target_type,target_id')
    .eq('anonymous_user_id', profile.id)
    .in('target_id', targetIds);

  if (error) {
    console.warn('Could not fetch current user helpful votes:', error.message);
    return new Set();
  }

  return new Set(data.map((vote) => `${vote.target_type}:${vote.target_id}`));
}

export async function fetchPosts() {
  if (!isSupabaseConfigured || !supabase) {
    await wait();
    const voteSet = new Set(demoState.helpfulVotes.map((vote) => `${vote.target_type}:${vote.target_id}`));
    return demoState.posts.map((post) => ({
      ...post,
      has_helpful_vote: voteSet.has(`post:${post.id}`)
    }));
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .lt('report_count', 5)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const voteSet = await getMyVoteSet((data || []).map((post) => post.id));

  return (data || []).map((post) => ({
    ...post,
    has_helpful_vote: voteSet.has(`post:${post.id}`)
  }));
}

export async function fetchPostWithReplies(postId) {
  if (!isSupabaseConfigured || !supabase) {
    await wait();
    const post = demoState.posts.find((item) => item.id === postId);
    if (!post) throw new Error('Post not found.');
    const replies = demoState.replies
      .filter((reply) => reply.post_id === postId && reply.report_count < 5)
      .sort((a, b) => Number(b.is_accepted) - Number(a.is_accepted) || b.helpful_count - a.helpful_count || new Date(a.created_at) - new Date(b.created_at));
    const voteSet = new Set(demoState.helpfulVotes.map((vote) => `${vote.target_type}:${vote.target_id}`));
    return {
      post: { ...post, has_helpful_vote: voteSet.has(`post:${post.id}`) },
      replies: replies.map((reply) => ({ ...reply, has_helpful_vote: voteSet.has(`reply:${reply.id}`) }))
    };
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .lt('report_count', 5)
    .single();

  if (postError) throw new Error(postError.message);

  const { data: replies, error: repliesError } = await supabase
    .from('replies')
    .select('*')
    .eq('post_id', postId)
    .lt('report_count', 5)
    .order('is_accepted', { ascending: false })
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: true });

  if (repliesError) throw new Error(repliesError.message);

  const targetIds = [post.id, ...(replies || []).map((reply) => reply.id)];
  const voteSet = await getMyVoteSet(targetIds);

  return {
    post: { ...post, has_helpful_vote: voteSet.has(`post:${post.id}`) },
    replies: (replies || []).map((reply) => ({
      ...reply,
      has_helpful_vote: voteSet.has(`reply:${reply.id}`)
    }))
  };
}

export async function createPost(payload) {
  const profile = await getAnonymousProfile();

  if (!isSupabaseConfigured || !supabase) {
    await wait();
    const post = {
      id: crypto.randomUUID(),
      ...payload,
      anonymous_name: profile.anonymousName,
      anonymous_user_id: profile.id,
      helpful_count: 0,
      reply_count: 0,
      is_solved: false,
      accepted_reply_id: null,
      report_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      has_helpful_vote: false
    };
    demoState.posts.unshift(post);
    return post;
  }

  requireSupabaseAuth(profile);
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...payload,
      anonymous_name: profile.anonymousName,
      anonymous_user_id: profile.id
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createReply(postId, body) {
  const profile = await getAnonymousProfile();

  if (!isSupabaseConfigured || !supabase) {
    await wait();
    const reply = {
      id: crypto.randomUUID(),
      post_id: postId,
      body,
      anonymous_name: profile.anonymousName,
      anonymous_user_id: profile.id,
      helpful_count: 0,
      is_accepted: false,
      report_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      has_helpful_vote: false
    };
    demoState.replies.push(reply);
    demoState.posts = demoState.posts.map((post) =>
      post.id === postId
        ? { ...post, reply_count: post.reply_count + 1, updated_at: new Date().toISOString() }
        : post
    );
    return reply;
  }

  requireSupabaseAuth(profile);
  const { data, error } = await supabase
    .from('replies')
    .insert({
      post_id: postId,
      body,
      anonymous_name: profile.anonymousName,
      anonymous_user_id: profile.id
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleHelpfulVote(targetType, targetId) {
  const profile = await getAnonymousProfile();

  if (!isSupabaseConfigured || !supabase) {
    await wait(150);
    const index = demoState.helpfulVotes.findIndex(
      (vote) => vote.target_type === targetType && vote.target_id === targetId
    );
    const delta = index >= 0 ? -1 : 1;

    if (index >= 0) demoState.helpfulVotes.splice(index, 1);
    else demoState.helpfulVotes.push({ id: crypto.randomUUID(), target_type: targetType, target_id: targetId, anonymous_user_id: profile.id });

    if (targetType === 'post') {
      demoState.posts = demoState.posts.map((post) => post.id === targetId ? { ...post, helpful_count: Math.max(0, post.helpful_count + delta) } : post);
    } else {
      demoState.replies = demoState.replies.map((reply) => reply.id === targetId ? { ...reply, helpful_count: Math.max(0, reply.helpful_count + delta) } : reply);
    }
    return { active: index < 0 };
  }

  requireSupabaseAuth(profile);
  const { data: existing, error: lookupError } = await supabase
    .from('helpful_votes')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('anonymous_user_id', profile.id)
    .maybeSingle();

  if (lookupError) throw new Error(lookupError.message);

  if (existing) {
    const { error } = await supabase.from('helpful_votes').delete().eq('id', existing.id);
    if (error) throw new Error(error.message);
    return { active: false };
  }

  const { error } = await supabase.from('helpful_votes').insert({
    target_type: targetType,
    target_id: targetId,
    anonymous_user_id: profile.id
  });

  if (error) {
    if (error.code === '23505') return { active: true };
    throw new Error(error.message);
  }

  return { active: true };
}

export async function reportContent(targetType, targetId, reason, details = '') {
  const profile = await getAnonymousProfile();

  if (!isSupabaseConfigured || !supabase) {
    await wait(150);
    demoState.reports.push({ id: crypto.randomUUID(), target_type: targetType, target_id: targetId, reason, details, anonymous_user_id: profile.id, created_at: new Date().toISOString() });
    if (targetType === 'post') {
      demoState.posts = demoState.posts.map((post) => post.id === targetId ? { ...post, report_count: post.report_count + 1 } : post);
    } else {
      demoState.replies = demoState.replies.map((reply) => reply.id === targetId ? { ...reply, report_count: reply.report_count + 1 } : reply);
    }
    return true;
  }

  requireSupabaseAuth(profile);
  const { error } = await supabase.from('reports').insert({
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details || null,
    anonymous_user_id: profile.id
  });

  if (error) throw new Error(error.message);
  return true;
}

export async function markAcceptedAnswer(postId, replyId) {
  const profile = await getAnonymousProfile();

  if (!isSupabaseConfigured || !supabase) {
    await wait(150);
    const post = demoState.posts.find((item) => item.id === postId);
    if (!post) throw new Error('Post not found.');
    if (post.anonymous_user_id !== profile.id) throw new Error('Only the anonymous creator can mark this post solved.');

    demoState.posts = demoState.posts.map((item) => item.id === postId ? { ...item, is_solved: true, accepted_reply_id: replyId, updated_at: new Date().toISOString() } : item);
    demoState.replies = demoState.replies.map((reply) => reply.post_id === postId ? { ...reply, is_accepted: reply.id === replyId } : reply);
    return true;
  }

  requireSupabaseAuth(profile);
  const { error } = await supabase
    .from('posts')
    .update({ is_solved: true, accepted_reply_id: replyId })
    .eq('id', postId)
    .eq('anonymous_user_id', profile.id);

  if (error) throw new Error(error.message);
  return true;
}

export function subscribeToBoard(onChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel('hollayall-board')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'replies' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'helpful_votes' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
