import AskQuestionForm from '../components/AskQuestionForm';

export default function AskPage({ onSubmit }) {
  return <section className="container-page py-4"><AskQuestionForm onSubmit={onSubmit} /></section>;
}
