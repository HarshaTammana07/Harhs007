import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { BuildingsList } from "@/components/properties/BuildingsList";

export default function BuildingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <BuildingsList />
      </AppLayout>
    </ProtectedRoute>
  );
}
