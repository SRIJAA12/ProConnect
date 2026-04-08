// This file defines the structure of our data
// Think of it like a template or blueprint for our data

// Faculty/Teacher information
export interface Faculty {
  id: string;                    // Unique identifier
  employeeId: string;            // Employee ID (like: FAC001)
  email: string;                 // Must end with @psgitech.ac.in
  password: string;              // Will be hashed for security
  createdAt: Date;              // When account was created
}

// Parent/Guardian Details
export interface ParentDetails {
  status: 'alive' | 'nil' | 'deceased'; // nil means not applicable, deceased means deceased
  name: string;                         // Full name (optional if status is 'nil')
  contactNumber: string;                // Contact number
  whatsappNumber?: string;              // WhatsApp number (optional)
  personalEmail?: string;               // Personal email
  
  // Education Details
  education: string;                    // Highest qualification
  
  // Occupation Type
  occupationType: 'homemaker' | 'employed' | 'self-employed' | 'retired' | ''; // Must select one if alive
  
  // For Homemaker
  previousOccupation?: string;          // Optional previous occupation
  
  // For Employed
  employmentType?: 'government' | 'private' | 'public' | 'ngo' | ''; // Govt, Private, PSU, NGO
  organizationName?: string;            // Organization/Company name
  sector?: string;                      // Sector/Industry
  designation?: string;                 // Job title/Designation
  yearsOfExperience?: number;           // Years of experience
  officeAddress?: string;               // Office address
  officeContactNumber?: string;         // Office contact number
  officeEmail?: string;                 // Official email ID
  
  // For Self-Employed/Business
  businessName?: string;                // Business name
  businessType?: string;                // Type of business
  businessIndustry?: string;            // Industry
  businessRole?: string;                // Owner/Partner/Freelancer
  businessAddress?: string;             // Business address
}

// Relative/Family/Friend information in Engineering/Professional field
export interface RelativeInIT {
  name: string;                  // Full name
  gender: 'Male' | 'Female' | 'Other';
  relationship: string;          // Father, Mother, Brother, Uncle, Neighbor, etc.
  contactNumber: string;         // Phone number
  whatsappNumber?: string;       // WhatsApp number (optional)
  personalEmail?: string;        // Personal email
  email: string;                 // Email address
  education: string;             // Highest qualification
  occupationType: 'homemaker' | 'employed' | 'self-employed' | 'retired' | '';
  previousOccupation?: string;   // For homemaker
  employmentType?: 'government' | 'private' | 'public' | 'ngo' | '';
  organizationName?: string;     // Organization/Company name
  sector?: string;               // Sector/Industry
  designation: string;           // Job title
  yearsOfExperience: number;     // How many years of experience
  officeAddress?: string;        // Office address
  officeContactNumber?: string;  // Office contact number
  officeEmail?: string;          // Official email
  businessName?: string;         // Business name
  businessType?: string;         // Type of business
  businessIndustry?: string;     // Industry
  businessRole?: string;         // Owner/Partner/Freelancer
  businessAddress?: string;      // Business address
  company: string;               // Where they work (e.g., Google, TCS, Wipro, BHEL, L&T)
  workCity: string;              // City where they work (e.g., Chennai, Bangalore)
}

// Student information
export interface Student {
  id: string;                    // Unique identifier (auto-generated)
  
  // Basic Information
  studentName: string;
  mobileNo: string;
  parentMobile: string;
  personalMail: string;
  collegeMail: string;           // Must end with @psgitech.ac.in
  branch: string;                // ECE, CSE, AIDS, etc.
  section: string;               // A, B, C, D
  year: string;                  // First Year, Second Year, etc.
  rollNumber: string;
  
  // Parent Information
  parents: {
    mother: ParentDetails;
    father: ParentDetails;
    guardian?: ParentDetails;
  };
  
  // Siblings in Engineering/Professional field
  hasSiblingsInIT: boolean;
  siblings: {
    name: string;
    contactNumber: string;
    whatsappNumber?: string;
    personalEmail?: string;
    education: string;
    occupationType: 'homemaker' | 'employed' | 'self-employed' | 'retired' | '';
    previousOccupation?: string;
    employmentType?: 'government' | 'private' | 'public' | 'ngo' | '';
    organizationName?: string;
    sector?: string;
    designation: string;
    yearsOfExperience?: number;
    officeAddress?: string;
    officeContactNumber?: string;
    officeEmail?: string;
    businessName?: string;
    businessType?: string;
    businessIndustry?: string;
    businessRole?: string;
    businessAddress?: string;
    company: string;
    city: string;
  }[];
  
  // Relatives/Friends/Neighbors in Engineering/Professional field
  hasRelativesInIT: boolean;
  relativesInIT: RelativeInIT[];  // Array because a student can have multiple relatives
  
  // Metadata
  createdAt: Date;              // When form was submitted
  updatedAt: Date;              // Last update time
}

// For filtering on the dashboard
export interface FilterOptions {
  branch?: string;
  hasRelativesInIT?: boolean;
  relativeDesignation?: string;
  relativeCity?: string;
  relativeCompany?: string;
  searchQuery?: string;
}
