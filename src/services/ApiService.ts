import { supabase } from '@/lib/supabase'
import { 
  FamilyMember, 
  Building, 
  Apartment, 
  Flat, 
  Land, 
  Tenant, 
  RentPayment, 
  InsurancePolicy,
  Document,
  MaintenanceRecord
} from '@/types'

export class ApiService {
  // Family Members
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getFamilyMember(id: string): Promise<FamilyMember | null> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createFamilyMember(member: Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from('family_members')
      .insert(member)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from('family_members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteFamilyMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Buildings
  static async getBuildings(): Promise<Building[]> {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getBuilding(id: string): Promise<Building | null> {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createBuilding(building: Omit<Building, 'id' | 'created_at' | 'updated_at'>): Promise<Building> {
    const { data, error } = await supabase
      .from('buildings')
      .insert(building)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateBuilding(id: string, updates: Partial<Building>): Promise<Building> {
    const { data, error } = await supabase
      .from('buildings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteBuilding(id: string): Promise<void> {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Apartments
  static async getApartments(buildingId?: string): Promise<Apartment[]> {
    let query = supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (buildingId) {
      query = query.eq('building_id', buildingId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }

  static async getApartment(id: string): Promise<Apartment | null> {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createApartment(apartment: Omit<Apartment, 'id' | 'created_at' | 'updated_at'>): Promise<Apartment> {
    const { data, error } = await supabase
      .from('apartments')
      .insert(apartment)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateApartment(id: string, updates: Partial<Apartment>): Promise<Apartment> {
    const { data, error } = await supabase
      .from('apartments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteApartment(id: string): Promise<void> {
    const { error } = await supabase
      .from('apartments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }  // Fl
ats
  static async getFlats(): Promise<Flat[]> {
    const { data, error } = await supabase
      .from('flats')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getFlat(id: string): Promise<Flat | null> {
    const { data, error } = await supabase
      .from('flats')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createFlat(flat: Omit<Flat, 'id' | 'created_at' | 'updated_at'>): Promise<Flat> {
    const { data, error } = await supabase
      .from('flats')
      .insert(flat)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateFlat(id: string, updates: Partial<Flat>): Promise<Flat> {
    const { data, error } = await supabase
      .from('flats')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteFlat(id: string): Promise<void> {
    const { error } = await supabase
      .from('flats')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Lands
  static async getLands(): Promise<Land[]> {
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getLand(id: string): Promise<Land | null> {
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createLand(land: Omit<Land, 'id' | 'created_at' | 'updated_at'>): Promise<Land> {
    const { data, error } = await supabase
      .from('lands')
      .insert(land)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateLand(id: string, updates: Partial<Land>): Promise<Land> {
    const { data, error } = await supabase
      .from('lands')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteLand(id: string): Promise<void> {
    const { error } = await supabase
      .from('lands')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Tenants
  static async getTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getTenant(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createTenant(tenant: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteTenant(id: string): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Rent Payments
  static async getRentPayments(propertyId?: string): Promise<RentPayment[]> {
    let query = supabase
      .from('rent_payments')
      .select('*')
      .order('payment_date', { ascending: false })
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }

  static async getRentPayment(id: string): Promise<RentPayment | null> {
    const { data, error } = await supabase
      .from('rent_payments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createRentPayment(payment: Omit<RentPayment, 'id' | 'created_at' | 'updated_at'>): Promise<RentPayment> {
    const { data, error } = await supabase
      .from('rent_payments')
      .insert(payment)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateRentPayment(id: string, updates: Partial<RentPayment>): Promise<RentPayment> {
    const { data, error } = await supabase
      .from('rent_payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteRentPayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('rent_payments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }  // Insu
rance Policies
  static async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getInsurancePolicy(id: string): Promise<InsurancePolicy | null> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createInsurancePolicy(policy: Omit<InsurancePolicy, 'id' | 'created_at' | 'updated_at'>): Promise<InsurancePolicy> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert(policy)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateInsurancePolicy(id: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteInsurancePolicy(id: string): Promise<void> {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Documents
  static async getDocuments(entityType?: string, entityId?: string): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (entityType) {
      query = query.eq('entity_type', entityType)
    }
    
    if (entityId) {
      query = query.eq('entity_id', entityId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }

  static async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Maintenance Records
  static async getMaintenanceRecords(propertyId?: string): Promise<MaintenanceRecord[]> {
    let query = supabase
      .from('maintenance_records')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }

  static async getMaintenanceRecord(id: string): Promise<MaintenanceRecord | null> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(record)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateMaintenanceRecord(id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteMaintenanceRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // File Upload
  static async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)
    
    return publicUrl
  }

  // File Delete
  static async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  }

  // Dashboard Analytics
  static async getDashboardStats(): Promise<{
    totalProperties: number
    totalTenants: number
    monthlyRentCollection: number
    pendingMaintenance: number
    expiringDocuments: number
  }> {
    const [
      buildingsCount,
      flatsCount,
      landsCount,
      tenantsCount,
      rentPayments,
      maintenanceRecords,
      documents
    ] = await Promise.all([
      supabase.from('buildings').select('id', { count: 'exact' }),
      supabase.from('flats').select('id', { count: 'exact' }),
      supabase.from('lands').select('id', { count: 'exact' }),
      supabase.from('tenants').select('id', { count: 'exact' }),
      supabase.from('rent_payments')
        .select('amount')
        .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('maintenance_records')
        .select('id', { count: 'exact' })
        .eq('status', 'pending'),
      supabase.from('documents')
        .select('id', { count: 'exact' })
        .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const totalProperties = (buildingsCount.count || 0) + (flatsCount.count || 0) + (landsCount.count || 0)
    const monthlyRentCollection = rentPayments.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    return {
      totalProperties,
      totalTenants: tenantsCount.count || 0,
      monthlyRentCollection,
      pendingMaintenance: maintenanceRecords.count || 0,
      expiringDocuments: documents.count || 0
    }
  }
}