import { demoPosts, demoReplies } from '../data/demoData';
import { getAnonymousProfile } from './anonymousIdentity';
import { isDemoMode, isSupabaseConfigured, supabase } from './supabase';

export const ATTACHMENT_BUCKET = 'post-attachments';
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE_MB = 10;
export const MAX_ATTACHMENT_SIZE = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;

let demoState = {
  posts: demoPosts.map((p) => ({ ...p, post_attachments: p.post_attachments || [] })),
  replies: demoReplies.map((r) => ({ ...r })),
  helpfulVotes: [],
  reports: []
};

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function requireConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Production database is not connected. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.');
  }
}

function requireSignedIn(profile) {
  if (!profile?.isAuthenticated) throw new Error(profile?.authError || 'Please sign in to continue.');
}

function requireAdmin(profile) {
  requireSignedIn(profile);
  if (!profile.isAdmin) throw new Error('This action requires admin access.');
}

export function validateAttachmentFiles(files = []) {
  const list = Array.from(files || []);
  if (list.length > MAX_ATTACHMENTS) throw new Error(`Upload up to ${MAX_ATTACHMENTS} files per post.`);
  const tooLarge = list.find((f) => f.size > MAX_ATTACHMENT_SIZE);
  if (tooLarge) throw new Error(`${tooLarge.name} is too large. Each file must be ${MAX_ATTACHMENT_SIZE_MB}MB or smaller.`);
  return list;
}

function safeFileName(name = 'attachment') {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96) || 'attachment';
}

function withAttachmentUrl(attachment) {
  if (!attachment) return attachment;
  if (!isSupabaseConfigured || !supabase || !attachment.file_path) return { ...attachment, url: attachment.url || attachment.public_url };
  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(attachment.file_path);
  return { ...attachment, url: data?.publicUrl || attachment.url };
}

function normalizePost(post, voteSet = new Set()) {
  return {
    ...post,
    post_attachments: (post.post_attachments || []).map(withAttachmentUrl),
    has_helpful_vote: voteSet.has(`post:${post.id}`)
  };
}

async function uploadPostAttachments(postId, files, profile) {
  const valid = validateAttachmentFiles(files);
  const rows = [];

  for (const file of valid) {
    const type = file.type || 'application/octet-stream';
    const path = `${profile.id}/${postId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: type });

    if (uploadError) throw new Error(`Could not upload ${file.name}: ${uploadError.message}`);

    const { data, error } = await supabase
      .from('post_attachments')
      .insert({
        post_id: postId,
        file_name: file.name,
        file_path: path,
        file_type: type,
        file_size: file.size,
        anonymous_user_id: profile.id
      })
      .select('*')
      .single();

    if (error) {
      await supabase.storage.from(ATTACHMENT_BUCKET).remove([path]);
      throw new Error(`Could not save attachment ${file.name}: ${error.message}`);
    }

    rows.push(withAttachmentUrl(data));
  }

  return rows;
}

async function getMyVoteSet(targetIds = []) {
  const profile = await getAnonymousProfile();
  if (!isSupabaseConfigured || !supabase || !profile.isAuthenticated || targetIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from('helpful_votes')
    .select('target_type,target_id')
    .eq('anonymous_user_id', profile.id)
    .in('target_id', targetIds);

  if (error) return new Set();
  return new Set(data.map((v) => `${v.target_type}:${v.target_id}`));
}

export async function fetchPosts() {
  if (isDemoMode) {
    await wait();
    const voteSet = new Set(demoState.helpfulVotes.map((v) => `${v.target_type}:${v.target_id}`));
    return demoState.posts.filter((p) => p.report_count < 5).map((p) => normalizePost(p, voteSet));
  }

  requireConfigured();
  const { data, error } = await supabase
    .from('posts')
    .select('*, post_attachments(*)')
    .lt('report_count', 5)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const voteSet = await getMyVoteSet((data || []).map((p) => p.id));
  return (data || []).map((p) => normalizePost(p, voteSet));
}

export async function fetchPostWithReplies(postId) {
  if (isDemoMode) {
    await wait();
    const post = demoState.posts.find((p) => p.id === postId && p.report_count < 5);
    if (!post) throw new Error('Post not found.');
    const replies = demoState.replies
      .filter((r) => r.post_id === postId && r.report_count < 5)
      .sort((a, b) => Number(b.is_accepted) - Number(a.is_accepted) || b.helpful_count - a.helpful_count || new Date(a.created_at) - new Date(b.created_at));
    const voteSet = new Set(demoState.helpfulVotes.map((v) => `${v.target_type}:${v.target_id}`));
    return {
      post: normalizePost(post, voteSet),
      replies: replies.map((r) => ({ ...r, has_helpful_vote: voteSet.has(`reply:${r.id}`) }))
    };
  }

  requireConfigured();
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*, post_attachments(*)')
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

  const voteSet = await getMyVoteSet([post.id, ...(replies || []).map((r) => r.id)]);
  return {
    post: normalizePost(post, voteSet),
    replies: (replies || []).map((r) => ({ ...r, has_helpful_vote: voteSet.has(`reply:${r.id}`) }))
  };
}

export async function createPost(payload) {
  const profile = await getAnonymousProfile();
  const { attachments = [], ...postPayload } = payload;

  if (isDemoMode) {
    await wait();
    const postId = crypto.randomUUID();
    const demoAttachments = validateAttachmentFiles(attachments).map((file) => ({
      id: crypto.randomUUID(),
      post_id: postId,
      file_name: file.name,
      file_path: '',
      file_type: file.type || 'application/octet-stream',
      file_size: file.size,
      anonymous_user_id: profile.id,
      url: URL.createObjectURL(file),
      created_at: new Date().toISOString()
    }));
    const post = {
      id: postId,
      ...postPayload,
      anonymous_name: profile.anonymousName,
      anonymous_user_id: profile.id,
      helpful_count: 0,
      reply_count: 0,
      is_solved: false,
      accepted_reply_id: null,
      report_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      post_attachments: demoAttachments,
      has_helpful_vote: false
    };
    demoState.posts.unshift(post);
    return post;
  }

  requireConfigured();
  requireSignedIn(profile);
  validateAttachmentFiles(attachments);

  const { data, error } = await supabase
    .from('posts')
    .insert({ ...postPayload, anonymous_name: profile.anonymousName, anonymous_user_id: profile.id })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  const uploaded = await uploadPostAttachments(data.id, attachments, profile);
  return normalizePost({ ...data, post_attachments: uploaded });
}

export async function createReply(postId, body) {
  const profile = await getAnonymousProfile();

  if (isDemoMode) {
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
    demoState.posts = demoState.posts.map((p) => p.id === postId ? { ...p, reply_count: p.reply_count + 1, updated_at: new Date().toISOString() } : p);
    return reply;
  }

  requireConfigured();
  requireSignedIn(profile);
  const { data, error } = await supabase
    .from('replies')
    .insert({ post_id: postId, body, anonymous_name: profile.anonymousName, anonymous_user_id: profile.id })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleHelpfulVote(targetType, targetId) {
  const profile = await getAnonymousProfile();

  if (isDemoMode) {
    await wait(150);
    const index = demoState.helpfulVotes.findIndex((v) => v.target_type === targetType && v.target_id === targetId && v.anonymous_user_id === profile.id);
    const delta = index >= 0 ? -1 : 1;
    if (index >= 0) demoState.helpfulVotes.splice(index, 1);
    else demoState.helpfulVotes.push({ id: crypto.randomUUID(), target_type: targetType, target_id: targetId, anonymous_user_id: profile.id });
    if (targetType === 'post') demoState.posts = demoState.posts.map((p) => p.id === targetId ? { ...p, helpful_count: Math.max(0, p.helpful_count + delta) } : p);
    else demoState.replies = demoState.replies.map((r) => r.id === targetId ? { ...r, helpful_count: Math.max(0, r.helpful_count + delta) } : r);
    return { active: index < 0 };
  }

  requireConfigured();
  requireSignedIn(profile);
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

  const { error } = await supabase.from('helpful_votes').insert({ target_type: targetType, target_id: targetId, anonymous_user_id: profile.id });
  if (error && error.code !== '23505') throw new Error(error.message);
  return { active: true };
}

export async function reportContent(targetType, targetId, reason, details = '') {
  const profile = await getAnonymousProfile();

  if (isDemoMode) {
    await wait(150);
    demoState.reports.push({ id: crypto.randomUUID(), target_type: targetType, target_id: targetId, reason, details, anonymous_user_id: profile.id, created_at: new Date().toISOString() });
    if (targetType === 'post') demoState.posts = demoState.posts.map((p) => p.id === targetId ? { ...p, report_count: p.report_count + 1 } : p);
    else demoState.replies = demoState.replies.map((r) => r.id === targetId ? { ...r, report_count: r.report_count + 1 } : r);
    return true;
  }

  requireConfigured();
  requireSignedIn(profile);
  const { error } = await supabase.from('reports').insert({ target_type: targetType, target_id: targetId, reason, details: details || null, anonymous_user_id: profile.id });
  if (error) throw new Error(error.message);
  return true;
}

export async function markAcceptedAnswer(postId, replyId) {
  const profile = await getAnonymousProfile();

  if (isDemoMode) {
    await wait(150);
    const post = demoState.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found.');
    if (post.anonymous_user_id !== profile.id) throw new Error('Only the creator can mark this post solved.');
    demoState.posts = demoState.posts.map((p) => p.id === postId ? { ...p, is_solved: true, accepted_reply_id: replyId, updated_at: new Date().toISOString() } : p);
    demoState.replies = demoState.replies.map((r) => r.post_id === postId ? { ...r, is_accepted: r.id === replyId } : r);
    return true;
  }

  requireConfigured();
  requireSignedIn(profile);
  const { error } = await supabase
    .from('posts')
    .update({ is_solved: true, accepted_reply_id: replyId })
    .eq('id', postId)
    .eq('anonymous_user_id', profile.id);

  if (error) throw new Error(error.message);
  return true;
}

export async function fetchAdminDashboard() {
  const profile = await getAnonymousProfile();
  if (isDemoMode) {
    await wait();
    requireAdmin({ ...profile, isAdmin: true });
    return {
      posts: demoState.posts,
      replies: demoState.replies,
      reports: demoState.reports,
      reportedPosts: demoState.posts.filter((p) => p.report_count > 0),
      reportedReplies: demoState.replies.filter((r) => r.report_count > 0)
    };
  }

  requireConfigured();
  requireAdmin(profile);
  const [postsResult, repliesResult, reportsResult] = await Promise.all([
    supabase.from('posts').select('*, post_attachments(*)').order('created_at', { ascending: false }),
    supabase.from('replies').select('*').order('created_at', { ascending: false }),
    supabase.from('reports').select('*').order('created_at', { ascending: false })
  ]);

  if (postsResult.error) throw new Error(postsResult.error.message);
  if (repliesResult.error) throw new Error(repliesResult.error.message);
  if (reportsResult.error) throw new Error(reportsResult.error.message);

  const posts = (postsResult.data || []).map((p) => normalizePost(p));
  const replies = repliesResult.data || [];
  const reports = reportsResult.data || [];

  return {
    posts,
    replies,
    reports,
    reportedPosts: posts.filter((p) => p.report_count > 0),
    reportedReplies: replies.filter((r) => r.report_count > 0)
  };
}

export async function adminKeepContent(targetType, targetId) {
  const profile = await getAnonymousProfile();
  if (isDemoMode) {
    requireAdmin({ ...profile, isAdmin: true });
    demoState.reports = demoState.reports.filter((r) => !(r.target_type === targetType && r.target_id === targetId));
    if (targetType === 'post') demoState.posts = demoState.posts.map((p) => p.id === targetId ? { ...p, report_count: 0 } : p);
    else demoState.replies = demoState.replies.map((r) => r.id === targetId ? { ...r, report_count: 0 } : r);
    return true;
  }
  requireConfigured();
  requireAdmin(profile);
  const { error } = await supabase.rpc('admin_keep_content', { p_target_type: targetType, p_target_id: targetId });
  if (error) throw new Error(error.message);
  return true;
}

export async function adminRemoveContent(targetType, targetId) {
  const profile = await getAnonymousProfile();
  if (isDemoMode) {
    requireAdmin({ ...profile, isAdmin: true });
    demoState.reports = demoState.reports.filter((r) => !(r.target_type === targetType && r.target_id === targetId));
    if (targetType === 'post') {
      demoState.posts = demoState.posts.filter((p) => p.id !== targetId);
      demoState.replies = demoState.replies.filter((r) => r.post_id !== targetId);
    } else {
      const reply = demoState.replies.find((r) => r.id === targetId);
      demoState.replies = demoState.replies.filter((r) => r.id !== targetId);
      if (reply) demoState.posts = demoState.posts.map((p) => p.id === reply.post_id ? { ...p, reply_count: Math.max(0, p.reply_count - 1) } : p);
    }
    return true;
  }
  requireConfigured();
  requireAdmin(profile);
  const { error } = await supabase.rpc('admin_remove_content', { p_target_type: targetType, p_target_id: targetId });
  if (error) throw new Error(error.message);
  return true;
}

export function subscribeToBoard(onChange) {
  if (isDemoMode || !isSupabaseConfigured || !supabase) return () => {};
  const channel = supabase
    .channel('hollayall-board')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'replies' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'helpful_votes' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_attachments' }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
