import PostDetail from '../components/PostDetail';

export default function PostPage({ postId, currentProfile, onBoardChanged, notify }) {
  return (
    <section className="container-page py-8">
      <PostDetail postId={postId} currentProfile={currentProfile} onBoardChanged={onBoardChanged} notify={notify} />
    </section>
  );
}
