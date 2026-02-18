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

// Relative/Family/Friend information in Engineering/Professional field
export interface RelativeInIT {
  name: string;                  // Full name
  gender: 'Male' | 'Female' | 'Other';
  relationship: string;          // Father, Mother, Brother, Uncle, Neighbor, etc.
  company: string;               // Where they work (e.g., Google, TCS, Wipro, BHEL, L&T)
  designation: string;           // Job title (e.g., Software Engineer, Manager, Design Engineer, Project Engineer)
  contactNumber: string;         // Phone number
  email: string;                 // Email address
  workCity: string;              // City where they work (e.g., Chennai, Bangalore)
  yearsOfExperience: number;     // How many years of experience
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
  year: string;                  // First Year, Second Year, etc.
  rollNumber: string;
  
  // Parent Information
  motherName: string;
  motherEducation: string;
  motherOccupation: string;
  fatherName: string;
  fatherEducation: string;
  fatherOccupation: string;
  
  // Siblings in IT
  hasSiblingsInIT: boolean;
  siblings: {
    name: string;
    education: string;
    company: string;
    designation: string;
    city: string;
  }[];
  
  // Relatives/Friends/Neighbors in IT/CS
  hasRelativesInIT: boolean;
  relativesInIT: RelativeInIT[];  // Array because a student can have multiple relatives
  
  // Additional academic information
  internships: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  
  awards: {
    name: string;
    year: string;
    description: string;
  }[];
  
  certificates: {
    name: string;
    issuer: string;
    date: string;
  }[];
  
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
