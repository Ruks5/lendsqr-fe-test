import { useNavigate } from 'react-router-dom';
import { StateMessage } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();
  return (
    <StateMessage
      variant="empty"
      title="Page not found"
      description="The page you’re looking for doesn’t exist or has moved."
      actionLabel="Go to dashboard"
      onAction={() => navigate('/dashboard')}
    />
  );
}
