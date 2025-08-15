import { supabase } from "@/lib/supabase";
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
  PropertyType,
  DocumentCategory,
  PremiumPayment,
  TenantReference,
  MaintenanceRecord,
} from "@/types";

/**
 * ApiService - Centralized service for all API operations with Supabase
 * Handles CRUD operations for all entities in the family business management system
 */
export class ApiService {
  // ==================== FAMILY MEMBERS ====================

  /**
   * Get all family members
   */
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch family members: ${error.message}`);

    return data.map(this.transformFamilyMember);
  }

  /**
   * Get family member by ID
   */
  static async getFamilyMemberById(id: string): Promise<FamilyMember | null> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to fetch family member: ${error.message}`);
    }

    return this.transformFamilyMember(data);
  }

  /**
   * Create a new family member
   */
  static async createFamilyMember(memberData: Omit<FamilyMember, "id" | "createdAt" | "updatedAt" | "documents" | "insurancePolicies">): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        full_name: memberData.fullName,
        nickname: memberData.nickname,
        profile_photo: memberData.profilePhoto,
        relationship: memberData.relationship,
        date_of_birth: memberData.dateOfBirth?.toISOString().split('T')[0],
        phone: memberData.contactInfo.phone,
        email: memberData.contactInfo.email,
        address: memberData.contactInfo.address,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create family member: ${error.message}`);

    return this.transformFamilyMember(data);
  }

  /**
   * Update family member
   */
  static async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    const updateData: any = {};
    
    if (updates.fullName) updateData.full_name = updates.fullName;
    if (updates.nickname) updateData.nickname = updates.nickname;
    if (updates.profilePhoto !== undefined) updateData.profile_photo = updates.profilePhoto;
    if (updates.relationship) updateData.relationship = updates.relationship;
    if (updates.dateOfBirth !== undefined) {
      updateData.date_of_birth = updates.dateOfBirth?.toISOString().split('T')[0];
    }
    if (updates.contactInfo) {
      if (updates.contactInfo.phone !== undefined) updateData.phone = updates.contactInfo.phone;
      if (updates.contactInfo.email !== undefined) updateData.email = updates.contactInfo.email;
      if (updates.contactInfo.address !== undefined) updateData.address = updates.contactInfo.address;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("family_members")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update family member: ${error.message}`);

    return this.transformFamilyMember(data);
  }

  /**
   * Delete family member
   */
  static async deleteFamilyMember(id: string): Promise<void> {
    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Failed to delete family member: ${error.message}`);
  }

  // ==================== BUILDINGS ====================

  /**
   * Get all buildings with their apartments
   */
  static async getBuildings(): Promise<Building[]> {
    const { data, error } = await supabase
      .from("buildings")
      .select(`
        *,
        apartments (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch buildings: ${error.message}`);

    return data.map(this.transformBuilding);
  }

  /**
   * Get building by ID
   */
  static async getBuildingById(id: string): Promise<Building | null> {
    const { data, error } = await supabase
      .from("buildings")
      .select(`
        *,
        apartments (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch building: ${error.message}`);
    }

    return this.transformBuilding(data);
  }

  /**
   * Create a new building
   */
  static async createBuilding(buildingData: Omit<Building, "id" | "createdAt" | "updatedAt" | "apartments" | "documents">): Promise<Building> {
    const { data, error } = await supabase
      .from("buildings")
      .insert({
        name: buildingData.name,
        building_code: buildingData.buildingCode,
        address: buildingData.address,
        description: buildingData.description,
        total_floors: buildingData.totalFloors,
        total_apartments: buildingData.totalApartments,
        amenities: buildingData.amenities,
        construction_year: buildingData.constructionYear,
        images: buildingData.images,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create building: ${error.message}`);

    return this.transformBuilding({ ...data, apartments: [] });
  }

  // ==================== APARTMENTS ====================

  /**
   * Get apartments by building ID
   */
  static async getApartmentsByBuildingId(buildingId: string): Promise<Apartment[]> {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .eq("building_id", buildingId)
      .order("floor", { ascending: true })
      .order("door_number", { ascending: true });

    if (error) throw new Error(`Failed to fetch apartments: ${error.message}`);

    return data.map(this.transformApartment);
  }

  /**
   * Create apartment
   */
  static async createApartment(apartmentData: Omit<Apartment, "id" | "createdAt" | "updatedAt" | "currentTenant" | "rentHistory" | "maintenanceRecords" | "documents">): Promise<Apartment> {
    const { data, error } = await supabase
      .from("apartments")
      .insert({
        building_id: apartmentData.buildingId,
        door_number: apartmentData.doorNumber,
        floor: apartmentData.floor,
        bedroom_count: apartmentData.bedroomCount,
        bathroom_count: apartmentData.bathroomCount,
        area: apartmentData.area,
        rent_amount: apartmentData.rentAmount,
        security_deposit: apartmentData.securityDeposit,
        is_occupied: apartmentData.isOccupied,
        furnished: apartmentData.specifications.furnished,
        parking: apartmentData.specifications.parking,
        balcony: apartmentData.specifications.balcony,
        air_conditioning: apartmentData.specifications.airConditioning,
        power_backup: apartmentData.specifications.powerBackup,
        water_supply: apartmentData.specifications.waterSupply,
        internet_ready: apartmentData.specifications.internetReady,
        additional_features: apartmentData.specifications.additionalFeatures,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create apartment: ${error.message}`);

    return this.transformApartment(data);
  }

  // ==================== FLATS ====================

  /**
   * Get all flats
   */
  static async getFlats(): Promise<Flat[]> {
    const { data, error } = await supabase
      .from("flats")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch flats: ${error.message}`);

    return data.map(this.transformFlat);
  }

  /**
   * Create flat
   */
  static async createFlat(flatData: Omit<Flat, "id" | "createdAt" | "updatedAt" | "currentTenant" | "rentHistory" | "maintenanceRecords" | "documents">): Promise<Flat> {
    const { data, error } = await supabase
      .from("flats")
      .insert({
        name: flatData.name,
        door_number: flatData.doorNumber,
        address: flatData.address,
        description: flatData.description,
        bedroom_count: flatData.bedroomCount,
        bathroom_count: flatData.bathroomCount,
        area: flatData.area,
        floor: flatData.floor,
        total_floors: flatData.totalFloors,
        rent_amount: flatData.rentAmount,
        security_deposit: flatData.securityDeposit,
        is_occupied: flatData.isOccupied,
        furnished: flatData.specifications.furnished,
        parking: flatData.specifications.parking,
        balcony: flatData.specifications.balcony,
        air_conditioning: flatData.specifications.airConditioning,
        power_backup: flatData.specifications.powerBackup,
        water_supply: flatData.specifications.waterSupply,
        internet_ready: flatData.specifications.internetReady,
        society_name: flatData.specifications.societyName,
        maintenance_charges: flatData.specifications.maintenanceCharges,
        additional_features: flatData.specifications.additionalFeatures,
        images: flatData.images,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create flat: ${error.message}`);

    return this.transformFlat(data);
  }

  // ==================== LANDS ====================

  /**
   * Get all lands
   */
  static async getLands(): Promise<Land[]> {
    const { data, error } = await supabase
      .from("lands")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch lands: ${error.message}`);

    return data.map(this.transformLand);
  }

  /**
   * Create land
   */
  static async createLand(landData: Omit<Land, "id" | "createdAt" | "updatedAt" | "currentTenant" | "rentHistory" | "maintenanceRecords" | "documents">): Promise<Land> {
    const { data, error } = await supabase
      .from("lands")
      .insert({
        name: landData.name,
        address: landData.address,
        description: landData.description,
        survey_number: landData.surveyNumber,
        area: landData.area,
        area_unit: landData.areaUnit,
        zoning: landData.zoning,
        soil_type: landData.soilType,
        water_source: landData.waterSource,
        road_access: landData.roadAccess,
        electricity_connection: landData.electricityConnection,
        is_leased: landData.isLeased,
        lease_type: landData.leaseTerms?.leaseType,
        rent_amount: landData.leaseTerms?.rentAmount,
        rent_frequency: landData.leaseTerms?.rentFrequency,
        lease_security_deposit: landData.leaseTerms?.securityDeposit,
        lease_duration: landData.leaseTerms?.leaseDuration,
        renewal_terms: landData.leaseTerms?.renewalTerms,
        restrictions: landData.leaseTerms?.restrictions,
        images: landData.images,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create land: ${error.message}`);

    return this.transformLand(data);
  }

  // ==================== TENANTS ====================

  /**
   * Get all tenants
   */
  static async getTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from("tenants")
      .select(`
        *,
        tenant_references (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch tenants: ${error.message}`);

    return data.map(this.transformTenant);
  }

  /**
   * Create tenant
   */
  static async createTenant(tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt" | "references" | "documents">): Promise<Tenant> {
    const { data, error } = await supabase
      .from("tenants")
      .insert({
        first_name: tenantData.personalInfo.firstName,
        last_name: tenantData.personalInfo.lastName,
        full_name: tenantData.personalInfo.fullName,
        date_of_birth: tenantData.personalInfo.dateOfBirth?.toISOString().split('T')[0],
        occupation: tenantData.personalInfo.occupation,
        employer: tenantData.personalInfo.employer,
        monthly_income: tenantData.personalInfo.monthlyIncome,
        marital_status: tenantData.personalInfo.maritalStatus,
        family_size: tenantData.personalInfo.familySize,
        nationality: tenantData.personalInfo.nationality,
        religion: tenantData.personalInfo.religion,
        phone: tenantData.contactInfo.phone,
        email: tenantData.contactInfo.email,
        address: tenantData.contactInfo.address,
        emergency_contact_name: tenantData.emergencyContact.name,
        emergency_contact_relationship: tenantData.emergencyContact.relationship,
        emergency_contact_phone: tenantData.emergencyContact.phone,
        emergency_contact_email: tenantData.emergencyContact.email,
        emergency_contact_address: tenantData.emergencyContact.address,
        aadhar_number: tenantData.identification.aadharNumber,
        pan_number: tenantData.identification.panNumber,
        driving_license: tenantData.identification.drivingLicense,
        passport: tenantData.identification.passport,
        voter_id_number: tenantData.identification.voterIdNumber,
        agreement_number: tenantData.rentalAgreement.agreementNumber,
        start_date: tenantData.rentalAgreement.startDate.toISOString().split('T')[0],
        end_date: tenantData.rentalAgreement.endDate.toISOString().split('T')[0],
        rent_amount: tenantData.rentalAgreement.rentAmount,
        security_deposit: tenantData.rentalAgreement.securityDeposit,
        maintenance_charges: tenantData.rentalAgreement.maintenanceCharges,
        rent_due_date: tenantData.rentalAgreement.rentDueDate,
        payment_method: tenantData.rentalAgreement.paymentMethod,
        late_fee_amount: tenantData.rentalAgreement.lateFeeAmount,
        notice_period: tenantData.rentalAgreement.noticePeriod,
        renewal_terms: tenantData.rentalAgreement.renewalTerms,
        special_conditions: tenantData.rentalAgreement.specialConditions,
        move_in_date: tenantData.moveInDate.toISOString().split('T')[0],
        move_out_date: tenantData.moveOutDate?.toISOString().split('T')[0],
        is_active: tenantData.isActive,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create tenant: ${error.message}`);

    return this.transformTenant({ ...data, tenant_references: [] });
  }

  // ==================== RENT PAYMENTS ====================

  /**
   * Get rent payments
   */
  static async getRentPayments(): Promise<RentPayment[]> {
    const { data, error } = await supabase
      .from("rent_payments")
      .select("*")
      .order("due_date", { ascending: false });

    if (error) throw new Error(`Failed to fetch rent payments: ${error.message}`);

    return data.map(this.transformRentPayment);
  }

  /**
   * Create rent payment
   */
  static async createRentPayment(paymentData: Omit<RentPayment, "id" | "createdAt" | "updatedAt">): Promise<RentPayment> {
    const { data, error } = await supabase
      .from("rent_payments")
      .insert({
        tenant_id: paymentData.tenantId,
        property_type: paymentData.propertyType,
        property_id: paymentData.propertyId,
        unit_id: paymentData.unitId,
        amount: paymentData.amount,
        due_date: paymentData.dueDate.toISOString().split('T')[0],
        paid_date: paymentData.paidDate?.toISOString().split('T')[0],
        status: paymentData.status,
        payment_method: paymentData.paymentMethod,
        transaction_id: paymentData.transactionId,
        receipt_number: paymentData.receiptNumber,
        notes: paymentData.notes,
        late_fee: paymentData.lateFee,
        discount: paymentData.discount,
        actual_amount_paid: paymentData.actualAmountPaid,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create rent payment: ${error.message}`);

    return this.transformRentPayment(data);
  }

  // ==================== INSURANCE POLICIES ====================

  /**
   * Get insurance policies
   */
  static async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select(`
        *,
        premium_payments (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch insurance policies: ${error.message}`);

    return data.map(this.transformInsurancePolicy);
  }

  /**
   * Create insurance policy
   */
  static async createInsurancePolicy(policyData: Omit<InsurancePolicy, "id" | "documents" | "premiumHistory">): Promise<InsurancePolicy> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .insert({
        policy_number: policyData.policyNumber,
        type: policyData.type,
        provider: policyData.provider,
        family_member_id: policyData.familyMemberId,
        premium_amount: policyData.premiumAmount,
        coverage_amount: policyData.coverageAmount,
        start_date: policyData.startDate.toISOString().split('T')[0],
        end_date: policyData.endDate.toISOString().split('T')[0],
        renewal_date: policyData.renewalDate.toISOString().split('T')[0],
        status: policyData.status,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create insurance policy: ${error.message}`);

    return this.transformInsurancePolicy({ ...data, premium_payments: [] });
  }

  // ==================== DOCUMENTS ====================

  /**
   * Get documents
   */
  static async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);

    return data.map(this.transformDocument);
  }

  /**
   * Create document
   */
  static async createDocument(documentData: Omit<Document, "id" | "createdAt" | "updatedAt">): Promise<Document> {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        title: documentData.title,
        category: documentData.category,
        file_data: documentData.fileData,
        file_name: documentData.fileName,
        file_size: documentData.fileSize,
        mime_type: documentData.mimeType,
        family_member_id: documentData.familyMemberId,
        property_type: documentData.propertyId ? 'building' : null, // You might need to adjust this logic
        property_id: documentData.propertyId,
        insurance_policy_id: documentData.insurancePolicyId,
        expiry_date: documentData.expiryDate?.toISOString().split('T')[0],
        issued_date: documentData.issuedDate?.toISOString().split('T')[0],
        issuer: documentData.issuer,
        document_number: documentData.documentNumber,
        tags: documentData.tags,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);

    return this.transformDocument(data);
  }

  // ==================== TRANSFORMATION METHODS ====================

  private static transformFamilyMember(data: any): FamilyMember {
    return {
      id: data.id,
      fullName: data.full_name,
      nickname: data.nickname,
      profilePhoto: data.profile_photo,
      relationship: data.relationship,
      dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      contactInfo: {
        phone: data.phone,
        email: data.email,
        address: data.address,
      },
      documents: [], // Will be populated separately if needed
      insurancePolicies: [], // Will be populated separately if needed
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformBuilding(data: any): Building {
    return {
      id: data.id,
      type: "building",
      name: data.name,
      buildingCode: data.building_code,
      address: data.address,
      description: data.description,
      totalFloors: data.total_floors,
      totalApartments: data.total_apartments,
      amenities: data.amenities || [],
      constructionYear: data.construction_year,
      images: data.images || [],
      apartments: data.apartments?.map(this.transformApartment) || [],
      documents: [], // Will be populated separately if needed
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformApartment(data: any): Apartment {
    return {
      id: data.id,
      buildingId: data.building_id,
      doorNumber: data.door_number,
      floor: data.floor,
      bedroomCount: data.bedroom_count,
      bathroomCount: data.bathroom_count,
      area: data.area,
      rentAmount: data.rent_amount,
      securityDeposit: data.security_deposit,
      isOccupied: data.is_occupied,
      specifications: {
        furnished: data.furnished,
        parking: data.parking,
        balcony: data.balcony,
        airConditioning: data.air_conditioning,
        powerBackup: data.power_backup,
        waterSupply: data.water_supply,
        internetReady: data.internet_ready,
        additionalFeatures: data.additional_features || [],
      },
      rentHistory: [], // Will be populated separately if needed
      maintenanceRecords: [], // Will be populated separately if needed
      documents: [], // Will be populated separately if needed
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformFlat(data: any): Flat {
    return {
      id: data.id,
      type: "flat",
      name: data.name,
      doorNumber: data.door_number,
      address: data.address,
      description: data.description,
      bedroomCount: data.bedroom_count,
      bathroomCount: data.bathroom_count,
      area: data.area,
      floor: data.floor,
      totalFloors: data.total_floors,
      rentAmount: data.rent_amount,
      securityDeposit: data.security_deposit,
      isOccupied: data.is_occupied,
      specifications: {
        furnished: data.furnished,
        parking: data.parking,
        balcony: data.balcony,
        airConditioning: data.air_conditioning,
        powerBackup: data.power_backup,
        waterSupply: data.water_supply,
        internetReady: data.internet_ready,
        societyName: data.society_name,
        maintenanceCharges: data.maintenance_charges,
        additionalFeatures: data.additional_features || [],
      },
      images: data.images || [],
      rentHistory: [], // Will be populated separately if needed
      maintenanceRecords: [], // Will be populated separately if needed
      documents: [], // Will be populated separately if needed
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformLand(data: any): Land {
    return {
      id: data.id,
      type: "land",
      name: data.name,
      address: data.address,
      description: data.description,
      surveyNumber: data.survey_number,
      area: data.area,
      areaUnit: data.area_unit,
      zoning: data.zoning,
      soilType: data.soil_type,
      waterSource: data.water_source,
      roadAccess: data.road_access,
      electricityConnection: data.electricity_connection,
      isLeased: data.is_leased,
      leaseTerms: data.lease_type ? {
        leaseType: data.lease_type,
        rentAmount: data.rent_amount,
        rentFrequency: data.rent_frequency,
        securityDeposit: data.lease_security_deposit,
        leaseDuration: data.lease_duration,
        renewalTerms: data.renewal_terms,
        restrictions: data.restrictions || [],
      } : undefined,
      images: data.images || [],
      rentHistory: [], // Will be populated separately if needed
      maintenanceRecords: [], // Will be populated separately if needed
      documents: [], // Will be populated separately if needed
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformTenant(data: any): Tenant {
    return {
      id: data.id,
      personalInfo: {
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: data.full_name,
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        occupation: data.occupation,
        employer: data.employer,
        monthlyIncome: data.monthly_income,
        maritalStatus: data.marital_status,
        familySize: data.family_size,
        nationality: data.nationality,
        religion: data.religion,
      },
      contactInfo: {
        phone: data.phone,
        email: data.email,
        address: data.address,
      },
      emergencyContact: {
        name: data.emergency_contact_name,
        relationship: data.emergency_contact_relationship,
        phone: data.emergency_contact_phone,
        email: data.emergency_contact_email,
        address: data.emergency_contact_address,
      },
      identification: {
        aadharNumber: data.aadhar_number,
        panNumber: data.pan_number,
        drivingLicense: data.driving_license,
        passport: data.passport,
        voterIdNumber: data.voter_id_number,
      },
      rentalAgreement: {
        agreementNumber: data.agreement_number,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        rentAmount: data.rent_amount,
        securityDeposit: data.security_deposit,
        maintenanceCharges: data.maintenance_charges,
        rentDueDate: data.rent_due_date,
        paymentMethod: data.payment_method,
        lateFeeAmount: data.late_fee_amount,
        noticePeriod: data.notice_period,
        renewalTerms: data.renewal_terms,
        specialConditions: data.special_conditions || [],
      },
      references: data.tenant_references?.map((ref: any) => ({
        name: ref.name,
        relationship: ref.relationship,
        phone: ref.phone,
        email: ref.email,
        address: ref.address,
        verified: ref.verified,
      })) || [],
      documents: [], // Will be populated separately if needed
      moveInDate: new Date(data.move_in_date),
      moveOutDate: data.move_out_date ? new Date(data.move_out_date) : undefined,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformRentPayment(data: any): RentPayment {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      propertyId: data.property_id,
      propertyType: data.property_type,
      unitId: data.unit_id,
      amount: data.amount,
      dueDate: new Date(data.due_date),
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      status: data.status,
      paymentMethod: data.payment_method,
      transactionId: data.transaction_id,
      receiptNumber: data.receipt_number,
      notes: data.notes,
      lateFee: data.late_fee,
      discount: data.discount,
      actualAmountPaid: data.actual_amount_paid,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformInsurancePolicy(data: any): InsurancePolicy {
    return {
      id: data.id,
      policyNumber: data.policy_number,
      type: data.type,
      provider: data.provider,
      familyMemberId: data.family_member_id,
      premiumAmount: data.premium_amount,
      coverageAmount: data.coverage_amount,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      renewalDate: new Date(data.renewal_date),
      status: data.status,
      documents: [], // Will be populated separately if needed
      premiumHistory: data.premium_payments?.map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        paidDate: new Date(payment.paid_date),
        dueDate: new Date(payment.due_date),
        paymentMethod: payment.payment_method,
      })) || [],
    };
  }

  private static transformDocument(data: any): Document {
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      fileData: data.file_data,
      fileName: data.file_name,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      familyMemberId: data.family_member_id,
      propertyId: data.property_id,
      insurancePolicyId: data.insurance_policy_id,
      expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      issuedDate: data.issued_date ? new Date(data.issued_date) : undefined,
      issuer: data.issuer,
      documentNumber: data.document_number,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Handle Supabase errors consistently
   */
  private static handleError(error: any, operation: string): never {
    console.error(`ApiService ${operation} error:`, error);
    throw new Error(`${operation} failed: ${error.message}`);
  }

  /**
   * Get dashboard summary data
   */
  static async getDashboardSummary() {
    try {
      const [buildings, flats, lands, tenants, rentPayments, expiredDocs] = await Promise.all([
        this.getBuildings(),
        this.getFlats(),
        this.getLands(),
        this.getTenants(),
        this.getRentPayments(),
        this.getExpiredDocuments(),
      ]);

      const totalProperties = buildings.length + flats.length + lands.length;
      const activeTenants = tenants.filter(t => t.isActive).length;
      const pendingPayments = rentPayments.filter(p => p.status === 'pending').length;
      const overduePayments = rentPayments.filter(p => p.status === 'overdue').length;

      return {
        totalProperties,
        activeTenants,
        pendingPayments,
        overduePayments,
        expiredDocuments: expiredDocs.length,
      };
    } catch (error) {
      this.handleError(error, 'getDashboardSummary');
    }
  }

  /**
   * Get expired documents
   */
  static async getExpiredDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .not("expiry_date", "is", null)
      .lt("expiry_date", new Date().toISOString().split('T')[0]);

    if (error) throw new Error(`Failed to fetch expired documents: ${error.message}`);

    return data.map(this.transformDocument);
  }
}