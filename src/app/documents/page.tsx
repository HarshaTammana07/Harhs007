import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentManagement } from "@/components/documents/DocumentManagement";

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <DocumentManagement />
      </AppLayout>
    </ProtectedRoute>
  );
}
