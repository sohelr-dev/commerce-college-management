import ProtectedPortal from '@/components/ProtectedPortal';

export default function AdminLayout({ children }) {
  return <ProtectedPortal role="admin">{children}</ProtectedPortal>;
}
