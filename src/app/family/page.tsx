import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { FamilyManagement } from "@/components/family/FamilyManagement";

export default function FamilyPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <FamilyManagement />
      </AppLayout>
    </ProtectedRoute>
  );
}
