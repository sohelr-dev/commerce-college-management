import ProtectedPortal from '@/components/ProtectedPortal';

export default function TeacherLayout({ children }) {
  return <ProtectedPortal role="teacher">{children}</ProtectedPortal>;
}
