import { supabase } from "@/lib/supabase";
import {
  Building,
  Apartment,
  Flat,
  Land,
  Tenant,
  PropertyType,
  RentPayment,
  MaintenanceRecord,
} from "@/types";

/**
 * PropertyApiService - Comprehensive API service for all property management operations
 * Handles Buildings, Apartments, Flats, Lands, and Tenants with Supabase integration
 */
export class PropertyApiService {
  
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
  /**

   * Update building
   */
  static async updateBuilding(id: string, updates: Partial<Building>): Promise<Building> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.buildingCode) updateData.building_code = updates.buildingCode;
    if (updates.address) updateData.address = updates.address;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.totalFloors) updateData.total_floors = updates.totalFloors;
    if (updates.totalApartments) updateData.total_apartments = updates.totalApartments;
    if (updates.amenities) updateData.amenities = updates.amenities;
    if (updates.constructionYear) updateData.construction_year = updates.constructionYear;
    if (updates.images) updateData.images = updates.images;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("buildings")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        apartments (*)
      `)
      .single();

    if (error) throw new Error(`Failed to update building: ${error.message}`);

    return this.transformBuilding(data);
  }

  /**
   * Delete building
   */
  static async deleteBuilding(id: string): Promise<void> {
    const { error } = await supabase
      .from("buildings")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Failed to delete building: ${error.message}`);
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

    return this.transformApartment(data);
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
        service_number: apartmentData.serviceNumber,
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
  }  /**
   * 
Update apartment
   */
  static async updateApartment(id: string, updates: Partial<Apartment>): Promise<Apartment> {
    const updateData: any = {};
    
    if (updates.doorNumber) updateData.door_number = updates.doorNumber;
    if (updates.serviceNumber !== undefined) updateData.service_number = updates.serviceNumber;
    if (updates.floor !== undefined) updateData.floor = updates.floor;
    if (updates.bedroomCount) updateData.bedroom_count = updates.bedroomCount;
    if (updates.bathroomCount) updateData.bathroom_count = updates.bathroomCount;
    if (updates.area) updateData.area = updates.area;
    if (updates.rentAmount) updateData.rent_amount = updates.rentAmount;
    if (updates.securityDeposit) updateData.security_deposit = updates.securityDeposit;
    if (updates.isOccupied !== undefined) updateData.is_occupied = updates.isOccupied;
    
    if (updates.specifications) {
      if (updates.specifications.furnished !== undefined) updateData.furnished = updates.specifications.furnished;
      if (updates.specifications.parking !== undefined) updateData.parking = updates.specifications.parking;
      if (updates.specifications.balcony !== undefined) updateData.balcony = updates.specifications.balcony;
      if (updates.specifications.airConditioning !== undefined) updateData.air_conditioning = updates.specifications.airConditioning;
      if (updates.specifications.powerBackup !== undefined) updateData.power_backup = updates.specifications.powerBackup;
      if (updates.specifications.waterSupply) updateData.water_supply = updates.specifications.waterSupply;
      if (updates.specifications.internetReady !== undefined) updateData.internet_ready = updates.specifications.internetReady;
      if (updates.specifications.additionalFeatures) updateData.additional_features = updates.specifications.additionalFeatures;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("apartments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update apartment: ${error.message}`);

    return this.transformApartment(data);
  }

  /**
   * Delete apartment
   */
  static async deleteApartment(id: string): Promise<void> {
    const { error } = await supabase
      .from("apartments")
      .delete()
      .eq("id", id);

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

    return data.map(this.transformFlat);
  }

  /**
   * Get flat by ID
   */
  static async getFlatById(id: string): Promise<Flat | null> {
    const { data, error } = await supabase
      .from("flats")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch flat: ${error.message}`);
    }

    return this.transformFlat(data);
  }

  /**
   * Create flat
   */
  static async createFlat(flatData: Omit<Flat, "id" | "createdAt" | "updatedAt" | "currentTenant" | "rentHistory" | "maintenanceRecords">): Promise<Flat> {
    const { data, error } = await supabase
      .from("flats")
      .insert({
        name: flatData.name,
        door_number: flatData.doorNumber,
        service_number: flatData.serviceNumber,
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
  }  /*
*
   * Update flat
   */
  static async updateFlat(id: string, updates: Partial<Flat>): Promise<Flat> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.doorNumber) updateData.door_number = updates.doorNumber;
    if (updates.serviceNumber !== undefined) updateData.service_number = updates.serviceNumber;
    if (updates.address) updateData.address = updates.address;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.bedroomCount) updateData.bedroom_count = updates.bedroomCount;
    if (updates.bathroomCount) updateData.bathroom_count = updates.bathroomCount;
    if (updates.area) updateData.area = updates.area;
    if (updates.floor) updateData.floor = updates.floor;
    if (updates.totalFloors) updateData.total_floors = updates.totalFloors;
    if (updates.rentAmount) updateData.rent_amount = updates.rentAmount;
    if (updates.securityDeposit) updateData.security_deposit = updates.securityDeposit;
    if (updates.isOccupied !== undefined) updateData.is_occupied = updates.isOccupied;
    if (updates.images) updateData.images = updates.images;
    
    if (updates.specifications) {
      if (updates.specifications.furnished !== undefined) updateData.furnished = updates.specifications.furnished;
      if (updates.specifications.parking !== undefined) updateData.parking = updates.specifications.parking;
      if (updates.specifications.balcony !== undefined) updateData.balcony = updates.specifications.balcony;
      if (updates.specifications.airConditioning !== undefined) updateData.air_conditioning = updates.specifications.airConditioning;
      if (updates.specifications.powerBackup !== undefined) updateData.power_backup = updates.specifications.powerBackup;
      if (updates.specifications.waterSupply) updateData.water_supply = updates.specifications.waterSupply;
      if (updates.specifications.internetReady !== undefined) updateData.internet_ready = updates.specifications.internetReady;
      if (updates.specifications.societyName !== undefined) updateData.society_name = updates.specifications.societyName;
      if (updates.specifications.maintenanceCharges !== undefined) updateData.maintenance_charges = updates.specifications.maintenanceCharges;
      if (updates.specifications.additionalFeatures) updateData.additional_features = updates.specifications.additionalFeatures;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("flats")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update flat: ${error.message}`);

    return this.transformFlat(data);
  }

  /**
   * Delete flat
   */
  static async deleteFlat(id: string): Promise<void> {
    const { error } = await supabase
      .from("flats")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Failed to delete flat: ${error.message}`);
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
   * Get land by ID
   */
  static async getLandById(id: string): Promise<Land | null> {
    const { data, error } = await supabase
      .from("lands")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch land: ${error.message}`);
    }

    return this.transformLand(data);
  }

  /**
   * Create land
   */
  static async createLand(landData: Omit<Land, "id" | "createdAt" | "updatedAt" | "currentTenant" | "rentHistory" | "maintenanceRecords">): Promise<Land> {
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
  }  /**
   *
 Update land
   */
  static async updateLand(id: string, updates: Partial<Land>): Promise<Land> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.address) updateData.address = updates.address;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.surveyNumber) updateData.survey_number = updates.surveyNumber;
    if (updates.area) updateData.area = updates.area;
    if (updates.areaUnit) updateData.area_unit = updates.areaUnit;
    if (updates.zoning) updateData.zoning = updates.zoning;
    if (updates.soilType) updateData.soil_type = updates.soilType;
    if (updates.waterSource) updateData.water_source = updates.waterSource;
    if (updates.roadAccess !== undefined) updateData.road_access = updates.roadAccess;
    if (updates.electricityConnection !== undefined) updateData.electricity_connection = updates.electricityConnection;
    if (updates.isLeased !== undefined) updateData.is_leased = updates.isLeased;
    if (updates.images) updateData.images = updates.images;
    
    if (updates.leaseTerms) {
      if (updates.leaseTerms.leaseType) updateData.lease_type = updates.leaseTerms.leaseType;
      if (updates.leaseTerms.rentAmount) updateData.rent_amount = updates.leaseTerms.rentAmount;
      if (updates.leaseTerms.rentFrequency) updateData.rent_frequency = updates.leaseTerms.rentFrequency;
      if (updates.leaseTerms.securityDeposit) updateData.lease_security_deposit = updates.leaseTerms.securityDeposit;
      if (updates.leaseTerms.leaseDuration) updateData.lease_duration = updates.leaseTerms.leaseDuration;
      if (updates.leaseTerms.renewalTerms) updateData.renewal_terms = updates.leaseTerms.renewalTerms;
      if (updates.leaseTerms.restrictions) updateData.restrictions = updates.leaseTerms.restrictions;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("lands")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update land: ${error.message}`);

    return this.transformLand(data);
  }

  /**
   * Delete land
   */
  static async deleteLand(id: string): Promise<void> {
    const { error } = await supabase
      .from("lands")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Failed to delete land: ${error.message}`);
  }  // ==
================== TENANTS ====================

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
   * Get tenant by ID
   */
  static async getTenantById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from("tenants")
      .select(`
        *,
        tenant_references (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch tenant: ${error.message}`);
    }

    return this.transformTenant(data);
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
/**
   * Update tenant
   */
  static async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const updateData: any = {};
    
    if (updates.personalInfo) {
      if (updates.personalInfo.firstName) updateData.first_name = updates.personalInfo.firstName;
      if (updates.personalInfo.lastName) updateData.last_name = updates.personalInfo.lastName;
      if (updates.personalInfo.fullName) updateData.full_name = updates.personalInfo.fullName;
      if (updates.personalInfo.dateOfBirth) updateData.date_of_birth = updates.personalInfo.dateOfBirth.toISOString().split('T')[0];
      if (updates.personalInfo.occupation) updateData.occupation = updates.personalInfo.occupation;
      if (updates.personalInfo.employer) updateData.employer = updates.personalInfo.employer;
      if (updates.personalInfo.monthlyIncome) updateData.monthly_income = updates.personalInfo.monthlyIncome;
      if (updates.personalInfo.maritalStatus) updateData.marital_status = updates.personalInfo.maritalStatus;
      if (updates.personalInfo.familySize) updateData.family_size = updates.personalInfo.familySize;
      if (updates.personalInfo.nationality) updateData.nationality = updates.personalInfo.nationality;
      if (updates.personalInfo.religion) updateData.religion = updates.personalInfo.religion;
    }
    
    if (updates.contactInfo) {
      if (updates.contactInfo.phone) updateData.phone = updates.contactInfo.phone;
      if (updates.contactInfo.email) updateData.email = updates.contactInfo.email;
      if (updates.contactInfo.address) updateData.address = updates.contactInfo.address;
    }
    
    if (updates.emergencyContact) {
      if (updates.emergencyContact.name) updateData.emergency_contact_name = updates.emergencyContact.name;
      if (updates.emergencyContact.relationship) updateData.emergency_contact_relationship = updates.emergencyContact.relationship;
      if (updates.emergencyContact.phone) updateData.emergency_contact_phone = updates.emergencyContact.phone;
      if (updates.emergencyContact.email) updateData.emergency_contact_email = updates.emergencyContact.email;
      if (updates.emergencyContact.address) updateData.emergency_contact_address = updates.emergencyContact.address;
    }
    
    if (updates.identification) {
      if (updates.identification.aadharNumber) updateData.aadhar_number = updates.identification.aadharNumber;
      if (updates.identification.panNumber) updateData.pan_number = updates.identification.panNumber;
      if (updates.identification.drivingLicense) updateData.driving_license = updates.identification.drivingLicense;
      if (updates.identification.passport) updateData.passport = updates.identification.passport;
      if (updates.identification.voterIdNumber) updateData.voter_id_number = updates.identification.voterIdNumber;
    }
    
    if (updates.rentalAgreement) {
      if (updates.rentalAgreement.agreementNumber) updateData.agreement_number = updates.rentalAgreement.agreementNumber;
      if (updates.rentalAgreement.startDate) updateData.start_date = updates.rentalAgreement.startDate.toISOString().split('T')[0];
      if (updates.rentalAgreement.endDate) updateData.end_date = updates.rentalAgreement.endDate.toISOString().split('T')[0];
      if (updates.rentalAgreement.rentAmount) updateData.rent_amount = updates.rentalAgreement.rentAmount;
      if (updates.rentalAgreement.securityDeposit) updateData.security_deposit = updates.rentalAgreement.securityDeposit;
      if (updates.rentalAgreement.maintenanceCharges) updateData.maintenance_charges = updates.rentalAgreement.maintenanceCharges;
      if (updates.rentalAgreement.rentDueDate) updateData.rent_due_date = updates.rentalAgreement.rentDueDate;
      if (updates.rentalAgreement.paymentMethod) updateData.payment_method = updates.rentalAgreement.paymentMethod;
      if (updates.rentalAgreement.lateFeeAmount) updateData.late_fee_amount = updates.rentalAgreement.lateFeeAmount;
      if (updates.rentalAgreement.noticePeriod) updateData.notice_period = updates.rentalAgreement.noticePeriod;
      if (updates.rentalAgreement.renewalTerms) updateData.renewal_terms = updates.rentalAgreement.renewalTerms;
      if (updates.rentalAgreement.specialConditions) updateData.special_conditions = updates.rentalAgreement.specialConditions;
    }
    
    if (updates.moveInDate) updateData.move_in_date = updates.moveInDate.toISOString().split('T')[0];
    if (updates.moveOutDate) updateData.move_out_date = updates.moveOutDate.toISOString().split('T')[0];
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("tenants")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        tenant_references (*)
      `)
      .single();

    if (error) throw new Error(`Failed to update tenant: ${error.message}`);

    return this.transformTenant(data);
  }  /*
*
   * Delete tenant
   */
  static async deleteTenant(id: string): Promise<void> {
    const { error } = await supabase
      .from("tenants")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Failed to delete tenant: ${error.message}`);
  }

  // ==================== PROPERTY ASSIGNMENTS ====================

  /**
   * Assign tenant to property
   */
  static async assignTenantToProperty(
    tenantId: string, 
    propertyType: "building" | "flat" | "land", 
    propertyId: string, 
    unitId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("property_tenants")
      .insert({
        tenant_id: tenantId,
        property_type: propertyType,
        property_id: propertyId,
        unit_id: unitId,
        assigned_date: new Date().toISOString().split('T')[0],
        is_current: true,
      });

    if (error) throw new Error(`Failed to assign tenant to property: ${error.message}`);

    // Update property occupancy status
    await this.updatePropertyOccupancy(propertyType, propertyId, unitId, true);
  }

  /**
   * Unassign tenant from property
   */
  static async unassignTenantFromProperty(
    tenantId: string, 
    propertyType: "building" | "flat" | "land", 
    propertyId: string, 
    unitId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("property_tenants")
      .update({
        unassigned_date: new Date().toISOString().split('T')[0],
        is_current: false,
      })
      .eq("tenant_id", tenantId)
      .eq("property_type", propertyType)
      .eq("property_id", propertyId)
      .eq("is_current", true);

    if (error) throw new Error(`Failed to unassign tenant from property: ${error.message}`);

    // Update property occupancy status
    await this.updatePropertyOccupancy(propertyType, propertyId, unitId, false);
  }

  /**
   * Get tenants by property
   */
  static async getTenantsByProperty(
    propertyType: "building" | "flat" | "land", 
    propertyId: string, 
    unitId?: string
  ): Promise<Tenant[]> {
    let query = supabase
      .from("property_tenants")
      .select(`
        *,
        tenants (
          *,
          tenant_references (*)
        )
      `)
      .eq("property_type", propertyType)
      .eq("property_id", propertyId)
      .eq("is_current", true);

    if (unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch tenants by property: ${error.message}`);

    return data.map((item: any) => this.transformTenant(item.tenants));
  }  // ===
================= UTILITY METHODS ====================

  /**
   * Update property occupancy status
   */
  private static async updatePropertyOccupancy(
    propertyType: "building" | "flat" | "land", 
    propertyId: string, 
    unitId: string | undefined, 
    isOccupied: boolean
  ): Promise<void> {
    if (propertyType === "building" && unitId) {
      // Update apartment occupancy
      await supabase
        .from("apartments")
        .update({ is_occupied: isOccupied })
        .eq("id", unitId);
    } else if (propertyType === "flat") {
      // Update flat occupancy
      await supabase
        .from("flats")
        .update({ is_occupied: isOccupied })
        .eq("id", propertyId);
    } else if (propertyType === "land") {
      // Update land lease status
      await supabase
        .from("lands")
        .update({ is_leased: isOccupied })
        .eq("id", propertyId);
    }
  }

  /**
   * Get property statistics
   */
  static async getPropertyStatistics() {
    try {
      const [buildings, flats, lands, tenants] = await Promise.all([
        this.getBuildings(),
        this.getFlats(),
        this.getLands(),
        this.getTenants()
      ]);

      const totalApartments = buildings.reduce((sum, building) => sum + building.apartments.length, 0);
      const occupiedApartments = buildings.reduce((sum, building) => 
        sum + building.apartments.filter(apt => apt.isOccupied).length, 0);
      const occupiedFlats = flats.filter(flat => flat.isOccupied).length;
      const leasedLands = lands.filter(land => land.isLeased).length;
      const activeTenants = tenants.filter(tenant => tenant.isActive).length;

      return {
        totalProperties: buildings.length + flats.length + lands.length,
        totalBuildings: buildings.length,
        totalApartments,
        totalFlats: flats.length,
        totalLands: lands.length,
        occupiedUnits: occupiedApartments + occupiedFlats + leasedLands,
        vacantUnits: (totalApartments - occupiedApartments) + (flats.length - occupiedFlats) + (lands.length - leasedLands),
        totalTenants: tenants.length,
        activeTenants,
        inactiveTenants: tenants.length - activeTenants,
        occupancyRate: ((occupiedApartments + occupiedFlats + leasedLands) / (totalApartments + flats.length + lands.length)) * 100,
      };
    } catch (error) {
      throw new Error(`Failed to get property statistics: ${error}`);
    }
  }

  /**
   * Search properties
   */
  static async searchProperties(query: string, propertyType?: PropertyType) {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    try {
      const results = {
        buildings: [] as Building[],
        flats: [] as Flat[],
        lands: [] as Land[],
      };

      if (!propertyType || propertyType === "building") {
        const { data: buildingData } = await supabase
          .from("buildings")
          .select(`*, apartments (*)`)
          .or(`name.ilike.${searchTerm},address.ilike.${searchTerm},building_code.ilike.${searchTerm}`);
        
        if (buildingData) {
          results.buildings = buildingData.map(this.transformBuilding);
        }
      }

      if (!propertyType || propertyType === "flat") {
        const { data: flatData } = await supabase
          .from("flats")
          .select("*")
          .or(`name.ilike.${searchTerm},address.ilike.${searchTerm},door_number.ilike.${searchTerm}`);
        
        if (flatData) {
          results.flats = flatData.map(this.transformFlat);
        }
      }

      if (!propertyType || propertyType === "land") {
        const { data: landData } = await supabase
          .from("lands")
          .select("*")
          .or(`name.ilike.${searchTerm},address.ilike.${searchTerm},survey_number.ilike.${searchTerm}`);
        
        if (landData) {
          results.lands = landData.map(this.transformLand);
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to search properties: ${error}`);
    }
  }  //
 ==================== TRANSFORMATION METHODS ====================

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
      serviceNumber: data.service_number,
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
      serviceNumber: data.service_number,
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
}