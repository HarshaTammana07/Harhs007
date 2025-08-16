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
  // Export supabase client for direct access when needed
  static supabase = supabase;

  // ==================== FAMILY MEMBERS ====================

  /**
   * Get all family members
   */
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch family members: ${error.message}`);

    return data.map(ApiService.transformFamilyMember);
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

    return ApiService.transformFamilyMember(data);
  }

  /**
   * Create a new family member
   */
  static async createFamilyMember(
    memberData: Omit<
      FamilyMember,
      "id" | "createdAt" | "updatedAt" | "documents" | "insurancePolicies"
    >
  ): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        full_name: memberData.fullName,
        nickname: memberData.nickname,
        profile_photo: memberData.profilePhoto,
        relationship: memberData.relationship,
        date_of_birth: memberData.dateOfBirth?.toISOString().split("T")[0],
        phone: memberData.contactInfo.phone,
        email: memberData.contactInfo.email,
        address: memberData.contactInfo.address,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create family member: ${error.message}`);

    return ApiService.transformFamilyMember(data);
  }

  /**
   * Update family member
   */
  static async updateFamilyMember(
    id: string,
    updates: Partial<FamilyMember>
  ): Promise<FamilyMember> {
    const updateData: unknown = {};

    if (updates.fullName) updateData.full_name = updates.fullName;
    if (updates.nickname) updateData.nickname = updates.nickname;
    if (updates.profilePhoto !== undefined)
      updateData.profile_photo = updates.profilePhoto;
    if (updates.relationship) updateData.relationship = updates.relationship;
    if (updates.dateOfBirth !== undefined) {
      updateData.date_of_birth = updates.dateOfBirth
        ?.toISOString()
        .split("T")[0];
    }
    if (updates.contactInfo) {
      if (updates.contactInfo.phone !== undefined)
        updateData.phone = updates.contactInfo.phone;
      if (updates.contactInfo.email !== undefined)
        updateData.email = updates.contactInfo.email;
      if (updates.contactInfo.address !== undefined)
        updateData.address = updates.contactInfo.address;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("family_members")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update family member: ${error.message}`);

    return ApiService.transformFamilyMember(data);
  }

  /**
   * Delete family member
   */
  static async deleteFamilyMember(id: string): Promise<void> {
    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", id);

    if (error)
      throw new Error(`Failed to delete family member: ${error.message}`);
  }

  // ==================== BUILDINGS ====================

  /**
   * Get all buildings with their apartments
   */
  static async getBuildings(): Promise<Building[]> {
    console.log("ApiService.getBuildings called");

    const { data, error } = await supabase
      .from("buildings")
      .select(
        `
        *,
        apartments (*)
      `
      )
      .order("created_at", { ascending: false });

    console.log(
      "Supabase getBuildings response - data:",
      data,
      "error:",
      error
    );

    if (error) throw new Error(`Failed to fetch buildings: ${error.message}`);

    const transformedBuildings = data.map(ApiService.transformBuilding);
    console.log("Transformed buildings:", transformedBuildings);

    return transformedBuildings;
  }

  /**
   * Get building by ID
   */
  static async getBuildingById(id: string): Promise<Building | null> {
    const { data, error } = await supabase
      .from("buildings")
      .select(
        `
        *,
        apartments (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch building: ${error.message}`);
    }

    return ApiService.transformBuilding(data);
  }

  /**
   * Create a new building
   */
  static async createBuilding(
    buildingData: Omit<
      Building,
      "id" | "createdAt" | "updatedAt" | "apartments" | "documents"
    >
  ): Promise<Building> {
    console.log("ApiService.createBuilding called with:", buildingData);

    // Ensure all required fields are present and properly formatted
    const insertData = {
      name: buildingData.name || "Unnamed Building",
      building_code: buildingData.buildingCode || "UNKNOWN",
      address: buildingData.address || "No Address",
      description: buildingData.description || null,
      total_floors: buildingData.totalFloors || 1,
      total_apartments: buildingData.totalApartments || 1,
      amenities: buildingData.amenities || [],
      construction_year:
        buildingData.constructionYear || new Date().getFullYear(),
      images: buildingData.images || [],
    };

    console.log("Insert data prepared:", insertData);

    try {
      const { data, error } = await supabase
        .from("buildings")
        .insert(insertData)
        .select()
        .single();

      console.log("Supabase insert response:");
      console.log("- Data:", data);
      console.log("- Error:", error);

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(`Failed to create building: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from building creation");
      }

      const transformedBuilding = ApiService.transformBuilding({
        ...data,
        apartments: [],
      });
      console.log("Transformed building:", transformedBuilding);

      return transformedBuilding;
    } catch (err: any) {
      console.error("Error in createBuilding:", err);
      throw err;
    }
  }

  /**
   * Update building
   */
  static async updateBuilding(
    id: string,
    updates: Partial<Building>
  ): Promise<Building> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.buildingCode) updateData.building_code = updates.buildingCode;
    if (updates.address) updateData.address = updates.address;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.totalFloors) updateData.total_floors = updates.totalFloors;
    if (updates.totalApartments)
      updateData.total_apartments = updates.totalApartments;
    if (updates.amenities) updateData.amenities = updates.amenities;
    if (updates.constructionYear)
      updateData.construction_year = updates.constructionYear;
    if (updates.images) updateData.images = updates.images;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("buildings")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        apartments (*)
      `
      )
      .single();

    if (error) throw new Error(`Failed to update building: ${error.message}`);

    return ApiService.transformBuilding(data);
  }

  // ==================== APARTMENTS ====================

  /**
   * Get apartments by building ID
   */
  static async getApartmentsByBuildingId(
    buildingId: string
  ): Promise<Apartment[]> {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .eq("building_id", buildingId)
      .order("floor", { ascending: true })
      .order("door_number", { ascending: true });

    if (error) throw new Error(`Failed to fetch apartments: ${error.message}`);

    return data.map(ApiService.transformApartment);
  }

  /**
   * Create apartment
   */
  static async createApartment(
    apartmentData: Omit<
      Apartment,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "currentTenant"
      | "rentHistory"
      | "maintenanceRecords"
      | "documents"
    >
  ): Promise<Apartment> {
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

    return ApiService.transformApartment(data);
  }

  /**
   * Get apartment by ID
   */
  static async getApartmentById(id: string): Promise<Apartment | null> {
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch apartment: ${error.message}`);
    }

    return ApiService.transformApartment(data);
  }

  /**
   * Update apartment
   */
  static async updateApartment(
    id: string,
    updates: Partial<Apartment>
  ): Promise<Apartment> {
    const updateData: any = {};

    if (updates.doorNumber) updateData.door_number = updates.doorNumber;
    if (updates.floor !== undefined) updateData.floor = updates.floor;
    if (updates.bedroomCount) updateData.bedroom_count = updates.bedroomCount;
    if (updates.bathroomCount)
      updateData.bathroom_count = updates.bathroomCount;
    if (updates.area) updateData.area = updates.area;
    if (updates.rentAmount) updateData.rent_amount = updates.rentAmount;
    if (updates.securityDeposit)
      updateData.security_deposit = updates.securityDeposit;
    if (updates.isOccupied !== undefined)
      updateData.is_occupied = updates.isOccupied;

    if (updates.specifications) {
      if (updates.specifications.furnished !== undefined)
        updateData.furnished = updates.specifications.furnished;
      if (updates.specifications.parking !== undefined)
        updateData.parking = updates.specifications.parking;
      if (updates.specifications.balcony !== undefined)
        updateData.balcony = updates.specifications.balcony;
      if (updates.specifications.airConditioning !== undefined)
        updateData.air_conditioning = updates.specifications.airConditioning;
      if (updates.specifications.powerBackup !== undefined)
        updateData.power_backup = updates.specifications.powerBackup;
      if (updates.specifications.waterSupply)
        updateData.water_supply = updates.specifications.waterSupply;
      if (updates.specifications.internetReady !== undefined)
        updateData.internet_ready = updates.specifications.internetReady;
      if (updates.specifications.additionalFeatures)
        updateData.additional_features =
          updates.specifications.additionalFeatures;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("apartments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update apartment: ${error.message}`);

    return ApiService.transformApartment(data);
  }

  /**
   * Delete apartment
   */
  static async deleteApartment(id: string): Promise<void> {
    const { error } = await supabase.from("apartments").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete apartment: ${error.message}`);
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

    return data.map(ApiService.transformFlat);
  }

  /**
   * Create flat
   */
  static async createFlat(
    flatData: Omit<
      Flat,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "currentTenant"
      | "rentHistory"
      | "maintenanceRecords"
      | "documents"
    >
  ): Promise<Flat> {
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

    return ApiService.transformFlat(data);
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

    return data.map(ApiService.transformLand);
  }

  /**
   * Create land
   */
  static async createLand(
    landData: Omit<
      Land,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "currentTenant"
      | "rentHistory"
      | "maintenanceRecords"
      | "documents"
    >
  ): Promise<Land> {
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

    return ApiService.transformLand(data);
  }

  /**
   * Delete building
   */
  static async deleteBuilding(id: string): Promise<void> {
    const { error } = await supabase.from("buildings").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete building: ${error.message}`);
  }

  /**
   * Delete flat
   */
  static async deleteFlat(id: string): Promise<void> {
    const { error } = await supabase.from("flats").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete flat: ${error.message}`);
  }

  /**
   * Delete land
   */
  static async deleteLand(id: string): Promise<void> {
    const { error } = await supabase.from("lands").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete land: ${error.message}`);
  }

  /**
   * Search properties
   */
  static async searchProperties(
    query: string,
    type?: PropertyType
  ): Promise<any[]> {
    const searchTerm = `%${query}%`;
    const results: any[] = [];

    try {
      if (!type || type === "building") {
        const { data: buildings } = await supabase
          .from("buildings")
          .select("*")
          .or(
            `name.ilike.${searchTerm},address.ilike.${searchTerm},building_code.ilike.${searchTerm}`
          );

        if (buildings) {
          results.push(...buildings.map(ApiService.transformBuilding));
        }
      }

      if (!type || type === "flat") {
        const { data: flats } = await supabase
          .from("flats")
          .select("*")
          .or(
            `name.ilike.${searchTerm},address.ilike.${searchTerm},door_number.ilike.${searchTerm}`
          );

        if (flats) {
          results.push(...flats.map(ApiService.transformFlat));
        }
      }

      if (!type || type === "land") {
        const { data: lands } = await supabase
          .from("lands")
          .select("*")
          .or(
            `name.ilike.${searchTerm},address.ilike.${searchTerm},survey_number.ilike.${searchTerm}`
          );

        if (lands) {
          results.push(...lands.map(ApiService.transformLand));
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Failed to search properties: ${error.message}`);
    }
  }

  /**
   * Get property statistics
   */
  static async getPropertyStatistics(): Promise<{
    totalBuildings: number;
    totalFlats: number;
    totalLands: number;
    totalApartments: number;
    occupiedUnits: number;
    vacantUnits: number;
    leasedLands: number;
  }> {
    try {
      const [buildings, flats, lands] = await Promise.all([
        this.getBuildings(),
        this.getFlats(),
        this.getLands(),
      ]);

      const totalApartments = buildings.reduce(
        (sum, building) => sum + (building.apartments?.length || 0),
        0
      );

      const occupiedFlats = flats.filter((flat) => flat.isOccupied).length;
      const vacantFlats = flats.filter((flat) => !flat.isOccupied).length;
      const leasedLands = lands.filter((land) => land.isLeased).length;

      return {
        totalBuildings: buildings.length,
        totalFlats: flats.length,
        totalLands: lands.length,
        totalApartments,
        occupiedUnits: occupiedFlats,
        vacantUnits: vacantFlats,
        leasedLands,
      };
    } catch (error: any) {
      throw new Error(`Failed to get property statistics: ${error.message}`);
    }
  }

  // ==================== TENANTS ====================

  /**
   * Get all tenants
   */
  static async getTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from("tenants")
      .select(
        `
        *,
        tenant_references (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch tenants: ${error.message}`);

    return data.map(ApiService.transformTenant);
  }

  /**
   * Get tenant by property ID and type
   */
  static async getTenantByProperty(propertyId: string, propertyType: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from("tenants")
      .select(
        `
        *,
        tenant_references (*)
      `
      )
      .eq("property_id", propertyId)
      .eq("property_type", propertyType)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No tenant found
      throw new Error(`Failed to fetch tenant: ${error.message}`);
    }

    return ApiService.transformTenant(data);
  }

  /**
   * Create tenant
   */
  static async createTenant(
    tenantData: Omit<
      Tenant,
      "id" | "createdAt" | "updatedAt" | "references" | "documents"
    >
  ): Promise<Tenant> {
    const { data, error } = await supabase
      .from("tenants")
      .insert({
        first_name: tenantData.personalInfo.firstName,
        last_name: tenantData.personalInfo.lastName,
        full_name: tenantData.personalInfo.fullName,
        date_of_birth: tenantData.personalInfo.dateOfBirth
          ?.toISOString()
          .split("T")[0],
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
        emergency_contact_relationship:
          tenantData.emergencyContact.relationship,
        emergency_contact_phone: tenantData.emergencyContact.phone,
        emergency_contact_email: tenantData.emergencyContact.email,
        emergency_contact_address: tenantData.emergencyContact.address,
        aadhar_number: tenantData.identification.aadharNumber,
        pan_number: tenantData.identification.panNumber,
        driving_license: tenantData.identification.drivingLicense,
        passport: tenantData.identification.passport,
        voter_id_number: tenantData.identification.voterIdNumber,
        agreement_number: tenantData.rentalAgreement.agreementNumber,
        start_date: tenantData.rentalAgreement.startDate
          .toISOString()
          .split("T")[0],
        end_date: tenantData.rentalAgreement.endDate
          .toISOString()
          .split("T")[0],
        rent_amount: tenantData.rentalAgreement.rentAmount,
        security_deposit: tenantData.rentalAgreement.securityDeposit,
        maintenance_charges: tenantData.rentalAgreement.maintenanceCharges,
        rent_due_date: tenantData.rentalAgreement.rentDueDate,
        payment_method: tenantData.rentalAgreement.paymentMethod,
        late_fee_amount: tenantData.rentalAgreement.lateFeeAmount,
        notice_period: tenantData.rentalAgreement.noticePeriod,
        renewal_terms: tenantData.rentalAgreement.renewalTerms,
        special_conditions: tenantData.rentalAgreement.specialConditions,
        move_in_date: tenantData.moveInDate.toISOString().split("T")[0],
        move_out_date: tenantData.moveOutDate?.toISOString().split("T")[0],
        is_active: tenantData.isActive,
        property_id: tenantData.propertyId,
        property_type: tenantData.propertyType,
        building_id: tenantData.buildingId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create tenant: ${error.message}`);

    return ApiService.transformTenant({ ...data, tenant_references: [] });
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

    if (error)
      throw new Error(`Failed to fetch rent payments: ${error.message}`);

    return data.map(ApiService.transformRentPayment);
  }

  /**
   * Create rent payment
   */
  static async createRentPayment(
    paymentData: Omit<RentPayment, "id" | "createdAt" | "updatedAt">
  ): Promise<RentPayment> {
    const { data, error } = await supabase
      .from("rent_payments")
      .insert({
        tenant_id: paymentData.tenantId,
        property_type: paymentData.propertyType,
        property_id: paymentData.propertyId,
        unit_id: paymentData.unitId,
        amount: paymentData.amount,
        due_date: paymentData.dueDate.toISOString().split("T")[0],
        paid_date: paymentData.paidDate?.toISOString().split("T")[0],
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

    if (error)
      throw new Error(`Failed to create rent payment: ${error.message}`);

    return ApiService.transformRentPayment(data);
  }

  // ==================== INSURANCE POLICIES ====================

  /**
   * Get insurance policies
   */
  static async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch insurance policies: ${error.message}`);

    return data.map(ApiService.transformInsurancePolicy);
  }

  // ==================== INSURANCE POLICIES ====================

  /**
   * Get all insurance policies
   */
  static async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch insurance policies: ${error.message}`);

    return data.map(ApiService.transformInsurancePolicy);
  }

  /**
   * Get insurance policy by ID
   */
  static async getInsurancePolicyById(
    id: string
  ): Promise<InsurancePolicy | null> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch insurance policy: ${error.message}`);
    }

    return ApiService.transformInsurancePolicy(data);
  }

  /**
   * Get policies by type
   */
  static async getPoliciesByType(
    type: InsurancePolicy["type"]
  ): Promise<InsurancePolicy[]> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch policies by type: ${error.message}`);

    return data.map(ApiService.transformInsurancePolicy);
  }

  /**
   * Get policies by family member
   */
  static async getPoliciesByFamilyMember(
    familyMemberId: string
  ): Promise<InsurancePolicy[]> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .eq("family_member_id", familyMemberId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to fetch policies by family member: ${error.message}`
      );

    return data.map(ApiService.transformInsurancePolicy);
  }

  /**
   * Create insurance policy
   */
  static async createInsurancePolicy(
    policyData: Omit<InsurancePolicy, "id" | "documents" | "premiumHistory">
  ): Promise<InsurancePolicy> {
    const { data, error } = await supabase
      .from("insurance_policies")
      .insert({
        policy_number: policyData.policyNumber,
        type: policyData.type,
        provider: policyData.provider,
        family_member_id: policyData.familyMemberId,
        premium_amount: policyData.premiumAmount,
        coverage_amount: policyData.coverageAmount,
        start_date: policyData.startDate.toISOString().split("T")[0],
        end_date: policyData.endDate.toISOString().split("T")[0],
        renewal_date: policyData.renewalDate.toISOString().split("T")[0],
        status: policyData.status,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create insurance policy: ${error.message}`);

    return ApiService.transformInsurancePolicy({ ...data, premium_payments: [] });
  }

  /**
   * Update insurance policy
   */
  static async updateInsurancePolicy(
    id: string,
    updates: Partial<InsurancePolicy>
  ): Promise<InsurancePolicy> {
    const updateData: any = {};

    if (updates.policyNumber) updateData.policy_number = updates.policyNumber;
    if (updates.type) updateData.type = updates.type;
    if (updates.provider) updateData.provider = updates.provider;
    if (updates.familyMemberId)
      updateData.family_member_id = updates.familyMemberId;
    if (updates.premiumAmount !== undefined)
      updateData.premium_amount = updates.premiumAmount;
    if (updates.coverageAmount !== undefined)
      updateData.coverage_amount = updates.coverageAmount;
    if (updates.startDate)
      updateData.start_date = updates.startDate.toISOString().split("T")[0];
    if (updates.endDate)
      updateData.end_date = updates.endDate.toISOString().split("T")[0];
    if (updates.renewalDate)
      updateData.renewal_date = updates.renewalDate.toISOString().split("T")[0];
    if (updates.status) updateData.status = updates.status;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("insurance_policies")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .single();

    if (error)
      throw new Error(`Failed to update insurance policy: ${error.message}`);

    return ApiService.transformInsurancePolicy(data);
  }

  /**
   * Delete insurance policy
   */
  static async deleteInsurancePolicy(id: string): Promise<void> {
    const { error } = await supabase
      .from("insurance_policies")
      .delete()
      .eq("id", id);

    if (error)
      throw new Error(`Failed to delete insurance policy: ${error.message}`);
  }

  /**
   * Add premium payment
   */
  static async addPremiumPayment(
    policyId: string,
    payment: Omit<PremiumPayment, "id">
  ): Promise<PremiumPayment> {
    const { data, error } = await supabase
      .from("premium_payments")
      .insert({
        policy_id: policyId,
        amount: payment.amount,
        paid_date: payment.paidDate.toISOString().split("T")[0],
        due_date: payment.dueDate.toISOString().split("T")[0],
        payment_method: payment.paymentMethod,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to add premium payment: ${error.message}`);

    return {
      id: data.id,
      amount: data.amount,
      paidDate: new Date(data.paid_date),
      dueDate: new Date(data.due_date),
      paymentMethod: data.payment_method,
    };
  }

  /**
   * Get policies expiring soon
   */
  static async getPoliciesExpiringSoon(
    days: number = 30
  ): Promise<InsurancePolicy[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from("insurance_policies")
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .lte("renewal_date", futureDate.toISOString().split("T")[0])
      .gte("renewal_date", new Date().toISOString().split("T")[0])
      .eq("status", "active")
      .order("renewal_date", { ascending: true });

    if (error)
      throw new Error(`Failed to fetch expiring policies: ${error.message}`);

    return data.map(ApiService.transformInsurancePolicy);
  }

  /**
   * Get expired policies
   */
  static async getExpiredPolicies(): Promise<InsurancePolicy[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("insurance_policies")
      .select(
        `
        *,
        premium_payments (*)
      `
      )
      .lt("renewal_date", today)
      .order("renewal_date", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch expired policies: ${error.message}`);

    return data.map(ApiService.transformInsurancePolicy);
  }

  // ==================== DOCUMENTS ====================

  /**
   * Get all documents
   */
  static async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return ApiService.transformDocument(data);
  }

  /**
   * Get documents by family member
   */
  static async getDocumentsByFamilyMember(
    familyMemberId: string
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("family_member_id", familyMemberId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to fetch documents by family member: ${error.message}`
      );

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get documents by property
   */
  static async getDocumentsByProperty(
    propertyId: string,
    propertyType: string
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("property_id", propertyId)
      .eq("property_type", propertyType)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to fetch documents by property: ${error.message}`
      );

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get documents by insurance policy
   */
  static async getDocumentsByInsurancePolicy(
    policyId: string
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("insurance_policy_id", policyId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to fetch documents by insurance policy: ${error.message}`
      );

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get documents by category
   */
  static async getDocumentsByCategory(
    category: DocumentCategory
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to fetch documents by category: ${error.message}`
      );

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get expiring documents
   */
  static async getExpiringDocuments(days: number = 30): Promise<Document[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .not("expiry_date", "is", null)
      .lte("expiry_date", futureDate.toISOString().split("T")[0])
      .gte("expiry_date", new Date().toISOString().split("T")[0])
      .order("expiry_date", { ascending: true });

    if (error)
      throw new Error(`Failed to fetch expiring documents: ${error.message}`);

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get expired documents
   */
  static async getExpiredDocuments(): Promise<Document[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .not("expiry_date", "is", null)
      .lt("expiry_date", today)
      .order("expiry_date", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch expired documents: ${error.message}`);

    return data.map(ApiService.transformDocument);
  }

  /**
   * Search documents with criteria
   */
  static async searchDocuments(criteria: {
    query?: string;
    category?: DocumentCategory;
    familyMemberId?: string;
    propertyId?: string;
    insurancePolicyId?: string;
    tags?: string[];
    isExpiring?: boolean;
    expiryDateRange?: { start?: Date; end?: Date };
    issuedDateRange?: { start?: Date; end?: Date };
  }): Promise<Document[]> {
    let query = supabase.from("documents").select("*");

    // Apply filters
    if (criteria.category) {
      query = query.eq("category", criteria.category);
    }

    if (criteria.familyMemberId) {
      query = query.eq("family_member_id", criteria.familyMemberId);
    }

    if (criteria.propertyId) {
      query = query.eq("property_id", criteria.propertyId);
    }

    if (criteria.insurancePolicyId) {
      query = query.eq("insurance_policy_id", criteria.insurancePolicyId);
    }

    if (criteria.expiryDateRange?.start) {
      query = query.gte(
        "expiry_date",
        criteria.expiryDateRange.start.toISOString().split("T")[0]
      );
    }

    if (criteria.expiryDateRange?.end) {
      query = query.lte(
        "expiry_date",
        criteria.expiryDateRange.end.toISOString().split("T")[0]
      );
    }

    if (criteria.issuedDateRange?.start) {
      query = query.gte(
        "issued_date",
        criteria.issuedDateRange.start.toISOString().split("T")[0]
      );
    }

    if (criteria.issuedDateRange?.end) {
      query = query.lte(
        "issued_date",
        criteria.issuedDateRange.end.toISOString().split("T")[0]
      );
    }

    if (criteria.isExpiring) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      query = query
        .not("expiry_date", "is", null)
        .lte("expiry_date", futureDate.toISOString().split("T")[0])
        .gte("expiry_date", new Date().toISOString().split("T")[0]);
    }

    // Text search (if supported by your database setup)
    if (criteria.query) {
      query = query.or(
        `title.ilike.%${criteria.query}%,document_number.ilike.%${criteria.query}%,issuer.ilike.%${criteria.query}%`
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to search documents: ${error.message}`);

    let results = data.map(ApiService.transformDocument);

    // Client-side filtering for tags (since PostgreSQL array search can be complex)
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter((doc) =>
        criteria.tags!.some((tag) =>
          doc.tags.some((docTag) =>
            docTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    return results;
  }

  /**
   * Create document
   */
  static async createDocument(
    documentData: Omit<Document, "id" | "createdAt" | "updatedAt">
  ): Promise<Document> {
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
        property_type: documentData.propertyId ? "building" : null, // You might need to adjust this logic
        property_id: documentData.propertyId,
        insurance_policy_id: documentData.insurancePolicyId,
        expiry_date: documentData.expiryDate?.toISOString().split("T")[0],
        issued_date: documentData.issuedDate?.toISOString().split("T")[0],
        issuer: documentData.issuer,
        document_number: documentData.documentNumber,
        tags: documentData.tags,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);

    return ApiService.transformDocument(data);
  }

  /**
   * Create document from file
   */
  static async createDocumentFromFile(
    file: File,
    metadata: {
      title: string;
      category: DocumentCategory;
      familyMemberId?: string;
      propertyId?: string;
      propertyType?: string;
      insurancePolicyId?: string;
      expiryDate?: Date;
      issuedDate?: Date;
      issuer?: string;
      documentNumber?: string;
      tags?: string[];
    }
  ): Promise<Document> {
    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const documentData = {
      title: metadata.title,
      category: metadata.category,
      fileData: base64Data,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      familyMemberId: metadata.familyMemberId,
      propertyId: metadata.propertyId,
      insurancePolicyId: metadata.insurancePolicyId,
      expiryDate: metadata.expiryDate,
      issuedDate: metadata.issuedDate,
      issuer: metadata.issuer,
      documentNumber: metadata.documentNumber,
      tags: metadata.tags || [],
    };

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
        property_type: metadata.propertyType,
        property_id: documentData.propertyId,
        insurance_policy_id: documentData.insurancePolicyId,
        expiry_date: documentData.expiryDate?.toISOString().split("T")[0],
        issued_date: documentData.issuedDate?.toISOString().split("T")[0],
        issuer: documentData.issuer,
        document_number: documentData.documentNumber,
        tags: documentData.tags,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create document from file: ${error.message}`);

    return ApiService.transformDocument(data);
  }

  /**
   * Update document
   */
  static async updateDocument(
    id: string,
    updates: Partial<Document>
  ): Promise<Document> {
    const updateData: any = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.category) updateData.category = updates.category;
    if (updates.familyMemberId !== undefined)
      updateData.family_member_id = updates.familyMemberId;
    if (updates.propertyId !== undefined)
      updateData.property_id = updates.propertyId;
    if (updates.insurancePolicyId !== undefined)
      updateData.insurance_policy_id = updates.insurancePolicyId;
    if (updates.expiryDate !== undefined) {
      updateData.expiry_date = updates.expiryDate?.toISOString().split("T")[0];
    }
    if (updates.issuedDate !== undefined) {
      updateData.issued_date = updates.issuedDate?.toISOString().split("T")[0];
    }
    if (updates.issuer !== undefined) updateData.issuer = updates.issuer;
    if (updates.documentNumber !== undefined)
      updateData.document_number = updates.documentNumber;
    if (updates.tags) updateData.tags = updates.tags;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update document: ${error.message}`);

    return ApiService.transformDocument(data);
  }

  /**
   * Delete document
   */
  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);
  }

  /**
   * Get document statistics
   */
  static async getDocumentStats(): Promise<{
    totalDocuments: number;
    documentsByCategory: Record<DocumentCategory, number>;
    expiringDocuments: number;
    expiredDocuments: number;
    documentsWithoutExpiry: number;
  }> {
    const [allDocs, expiring, expired] = await Promise.all([
      this.getDocuments(),
      this.getExpiringDocuments(30),
      this.getExpiredDocuments(),
    ]);

    const documentsByCategory = {} as Record<DocumentCategory, number>;
    const categories: DocumentCategory[] = [
      "aadhar",
      "pan",
      "driving_license",
      "passport",
      "house_documents",
      "business_documents",
      "insurance_documents",
      "bank_documents",
      "educational_certificates",
      "medical_records",
    ];

    categories.forEach((category) => {
      documentsByCategory[category] = allDocs.filter(
        (doc) => doc.category === category
      ).length;
    });

    const documentsWithoutExpiry = allDocs.filter(
      (doc) => !doc.expiryDate
    ).length;

    return {
      totalDocuments: allDocs.length,
      documentsByCategory,
      expiringDocuments: expiring.length,
      expiredDocuments: expired.length,
      documentsWithoutExpiry,
    };
  }

  // ==================== TRANSFORMATION METHODS ====================

  private static transformFamilyMember(data: any): FamilyMember {
    return {
      id: data.id,
      fullName: data.full_name,
      nickname: data.nickname,
      profilePhoto: data.profile_photo,
      relationship: data.relationship,
      dateOfBirth: data.date_of_birth
        ? new Date(data.date_of_birth)
        : undefined,
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
      apartments: data.apartments?.map(ApiService.transformApartment) || [],
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
      leaseTerms: data.lease_type
        ? {
            leaseType: data.lease_type,
            rentAmount: data.rent_amount,
            rentFrequency: data.rent_frequency,
            securityDeposit: data.lease_security_deposit,
            leaseDuration: data.lease_duration,
            renewalTerms: data.renewal_terms,
            restrictions: data.restrictions || [],
          }
        : undefined,
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
        dateOfBirth: data.date_of_birth
          ? new Date(data.date_of_birth)
          : undefined,
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
      references:
        data.tenant_references?.map((ref: any) => ({
          name: ref.name,
          relationship: ref.relationship,
          phone: ref.phone,
          email: ref.email,
          address: ref.address,
          verified: ref.verified,
        })) || [],
      documents: [], // Will be populated separately if needed
      moveInDate: new Date(data.move_in_date),
      moveOutDate: data.move_out_date
        ? new Date(data.move_out_date)
        : undefined,
      isActive: data.is_active,
      propertyId: data.property_id,
      propertyType: data.property_type,
      buildingId: data.building_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformRentPayment(data: unknown): RentPayment {
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

  private static transformInsurancePolicy(data: unknown): InsurancePolicy {
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
      premiumHistory:
        data.premium_payments?.map((payment: unknown) => ({
          id: payment.id,
          amount: payment.amount,
          paidDate: new Date(payment.paid_date),
          dueDate: new Date(payment.due_date),
          paymentMethod: payment.payment_method,
        })) || [],
    };
  }

  private static transformDocument(data: unknown): Document {
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
  private static handleError(error: unknown, operation: string): never {
    console.error(`ApiService ${operation} error:`, error);
    throw new Error(`${operation} failed: ${error.message}`);
  }

  /**
   * Get documents by family member
   */
  static async getDocumentsByFamilyMember(
    familyMemberId: string
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("family_member_id", familyMemberId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to fetch documents by family member: ${error.message}`
      );

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get documents by insurance policy
   */
  static async getDocumentsByInsurancePolicy(
    policyId: string
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("insurance_policy_id", policyId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to fetch documents by insurance policy: ${error.message}`
      );

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get expiring documents
   */
  static async getExpiringDocuments(days: number = 30): Promise<Document[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .not("expiry_date", "is", null)
      .gte("expiry_date", today.toISOString().split("T")[0])
      .lte("expiry_date", futureDate.toISOString().split("T")[0])
      .order("expiry_date", { ascending: true });

    if (error)
      throw new Error(`Failed to fetch expiring documents: ${error.message}`);

    return data.map(ApiService.transformDocument);
  }

  /**
   * Get document statistics
   */
  static async getDocumentStats() {
    try {
      const [allDocs, expiring, expired] = await Promise.all([
        this.getDocuments(),
        this.getExpiringDocuments(30),
        this.getExpiredDocuments(),
      ]);

      const statsByCategory: Record<DocumentCategory, number> = {
        aadhar: 0,
        pan: 0,
        driving_license: 0,
        passport: 0,
        house_documents: 0,
        business_documents: 0,
        insurance_documents: 0,
        bank_documents: 0,
        educational_certificates: 0,
        medical_records: 0,
      };

      allDocs.forEach((doc) => {
        if (statsByCategory[doc.category] !== undefined) {
          statsByCategory[doc.category]++;
        }
      });

      return {
        totalDocuments: allDocs.length,
        documentsByCategory: statsByCategory,
        expiringDocuments: expiring.length,
        expiredDocuments: expired.length,
        documentsWithoutExpiry: allDocs.filter((doc) => !doc.expiryDate).length,
      };
    } catch (error) {
      this.handleError(error, "getDocumentStats");
    }
  }

  /**
   * Get dashboard summary data
   */
  static async getDashboardSummary() {
    try {
      const [buildings, flats, lands, tenants, rentPayments, expiredDocs] =
        await Promise.all([
          this.getBuildings(),
          this.getFlats(),
          this.getLands(),
          this.getTenants(),
          this.getRentPayments(),
          this.getExpiredDocuments(),
        ]);

      const totalProperties = buildings.length + flats.length + lands.length;
      const activeTenants = tenants.filter((t) => t.isActive).length;
      const pendingPayments = rentPayments.filter(
        (p) => p.status === "pending"
      ).length;
      const overduePayments = rentPayments.filter(
        (p) => p.status === "overdue"
      ).length;

      return {
        totalProperties,
        activeTenants,
        pendingPayments,
        overduePayments,
        expiredDocuments: expiredDocs.length,
      };
    } catch (error) {
      this.handleError(error, "getDashboardSummary");
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
      .lt("expiry_date", new Date().toISOString().split("T")[0]);

    if (error)
      throw new Error(`Failed to fetch expired documents: ${error.message}`);

    return data.map(ApiService.transformDocument);
  }
}
