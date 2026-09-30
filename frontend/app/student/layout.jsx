import ProtectedPortal from '@/components/ProtectedPortal';

export default function StudentLayout({ children }) {
  return <ProtectedPortal role="student">{children}</ProtectedPortal>;
}
