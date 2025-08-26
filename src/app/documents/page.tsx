import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentManagement } from "@/components/documents/DocumentManagement";

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <DocumentManagement />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
