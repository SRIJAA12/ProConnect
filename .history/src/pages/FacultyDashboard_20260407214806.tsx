// Faculty Dashboard - View and Filter Student Data
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Student } from '../types';
import './FacultyDashboard.css';

function FacultyDashboard() {
  const navigate = useNavigate();
  
  // State for student data
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterHasRelatives, setFilterHasRelatives] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  
  // Autocomplete states
  const [branchInput, setBranchInput] = useState('');
  const [sectionInput, setSectionInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [designationInput, setDesignationInput] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Get unique values for filter dropdowns
  const [branches] = useState<string[]>([
    'CSE', 'ECE', 'EEE', 'ICE', 'MECH', 'CIVIL', 'AIDS', 'CSBS' , 'VLSI'
  ]);
  
  // Predefined cities - Major Indian cities
  const majorCities: string[] = [
    'Agra', 'Ahmedabad', 'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai',
    'Coimbatore', 'Delhi', 'Gurgaon', 'Guwahati', 'Hyderabad', 'Indore', 'Jaipur',
    'Kochi', 'Kolkata', 'Lucknow', 'Madurai', 'Mangalore', 'Mumbai', 'Mysore',
    'Nagpur', 'Nashik', 'Noida', 'Patna', 'Pune', 'Rajkot', 'Surat', 'Thiruvananthapuram',
    'Tiruchirappalli', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam'
  ];

  // Check authentication on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/faculty/login');
      } else {
        fetchStudents();
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Fetch all students from Firebase
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Query the 'students' collection
      const q = query(collection(db, 'students'));
      const querySnapshot = await getDocs(q);
      
      // Convert documents to Student objects
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({
          id: doc.id,
          ...doc.data()
        } as Student);
      });
      
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterBranch, filterSection, filterHasRelatives, filterCity, filterDesignation, filterCompany, students]);
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBranch, filterSection, filterHasRelatives, filterCity, filterDesignation, filterCompany]);

  // Autocomplete filter functions
  const filteredBranches = useMemo(() => {
    if (!branchInput && !filterBranch) return branches;
    const searchValue = branchInput || filterBranch || '';
    return branches.filter(branch => 
      branch.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [branchInput, filterBranch, branches]);
  
  // Get unique sections from actual student data
  const availableSections = useMemo(() => {
    const sections = new Set<string>();
    // Add default sections
    ['A', 'B', 'C', 'D'].forEach(section => sections.add(section));
    // Add sections from student data
    students.forEach(student => {
      if (student.section) {
        sections.add(student.section);
      }
    });
    return Array.from(sections).sort();
  }, [students]);
  
  const filteredSections = useMemo(() => {
    if (!sectionInput && !filterSection) return availableSections;
    const searchValue = sectionInput || filterSection || '';
    return availableSections.filter(section => 
      section.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [sectionInput, filterSection, availableSections]);
  
  // Get unique cities from actual student data with typo correction (both relatives and siblings)
  const availableCities = useMemo(() => {
    const citySet = new Set<string>();
    const cityMap: { [key: string]: string } = {
      'banglore': 'Bangalore',
      'bangalor': 'Bangalore',
      'bombay': 'Mumbai',
      'calcutta': 'Kolkata',
      'delhi': 'Delhi',
      'new delhi': 'Delhi',
      'hyderabad': 'Hyderabad',
      'chenai': 'Chennai',
      'madras': 'Chennai',
      'pune': 'Pune',
      'coimbatore': 'Coimbatore'
    };
    
    students.forEach(student => {
      // From Professional Contacts (relativesInIT)
      if (student.relativesInIT && student.relativesInIT.length > 0) {
        student.relativesInIT.forEach(relative => {
          if (relative.workCity) {
            const normalizedCity = relative.workCity.toLowerCase().trim();
            const correctedCity = cityMap[normalizedCity] || relative.workCity;
            citySet.add(correctedCity);
          }
        });
      }
      
      // From Siblings in Engineering/Professional Field
      if (student.hasSiblingsInIT && student.siblings && student.siblings.length > 0) {
        student.siblings.forEach(sibling => {
          if (sibling.city) {
            const normalizedCity = sibling.city.toLowerCase().trim();
            const correctedCity = cityMap[normalizedCity] || sibling.city;
            citySet.add(correctedCity);
          }
        });
      }
    });
    return Array.from(citySet).sort();
  }, [students]);
  
  const filteredCities = useMemo(() => {
    if (!cityInput) return availableCities;
    const searchValue = cityInput.toLowerCase();
    const matches = availableCities.filter(city => 
      city.toLowerCase().includes(searchValue)
    );
    
    // If no exact match found, add the custom input as an option
    if (matches.length === 0 && cityInput.trim()) {
      return [cityInput.trim()];
    }
    
    // If input doesn't exactly match any option, add it as first option
    const exactMatch = availableCities.find(c => c.toLowerCase() === searchValue);
    if (!exactMatch && cityInput.trim()) {
      return [cityInput.trim(), ...matches.slice(0, 9)];
    }
    
    return matches.slice(0, 10);
  }, [cityInput, availableCities]);
  
  // Get unique designations from actual student data with normalization (both relatives and siblings)
  const availableDesignations = useMemo(() => {
    const designationSet = new Set<string>();
    
    students.forEach(student => {
      // From Professional Contacts (relativesInIT)
      if (student.relativesInIT && student.relativesInIT.length > 0) {
        student.relativesInIT.forEach(relative => {
          if (relative.designation) {
            // Normalize designation: trim, fix spacing, capitalize properly
            const normalized = relative.designation
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            designationSet.add(normalized);
          }
        });
      }
      
      // From Siblings in Engineering/Professional Field
      if (student.hasSiblingsInIT && student.siblings && student.siblings.length > 0) {
        student.siblings.forEach(sibling => {
          if (sibling.designation) {
            // Normalize designation: trim, fix spacing, capitalize properly
            const normalized = sibling.designation
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            designationSet.add(normalized);
          }
        });
      }
    });
    return Array.from(designationSet).sort();
  }, [students]);
  
  const filteredDesignations = useMemo(() => {
    if (!designationInput) return availableDesignations;
    const searchValue = designationInput.toLowerCase();
    const matches = availableDesignations.filter(designation => 
      designation.toLowerCase().includes(searchValue)
    );
    
    // If no exact match found, add the custom input as an option
    if (matches.length === 0 && designationInput.trim()) {
      return [designationInput.trim()];
    }
    
    // If input doesn't exactly match any option, add it as first option
    const exactMatch = availableDesignations.find(d => d.toLowerCase() === searchValue);
    if (!exactMatch && designationInput.trim()) {
      return [designationInput.trim(), ...matches.slice(0, 9)];
    }
    
    return matches.slice(0, 10);
  }, [designationInput, availableDesignations]);
  
  // Pagination logic
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Filter logic
  const applyFilters = () => {
    let filtered = [...students];

    // Filter by search query (searches in name, roll number, email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.studentName?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query) ||
        student.collegeMail?.toLowerCase().includes(query) ||
        student.branch?.toLowerCase().includes(query)
      );
    }

    // Filter by branch (case-insensitive)
    if (filterBranch) {
      const branchQuery = filterBranch.toLowerCase();
      filtered = filtered.filter(student => 
        student.branch?.toLowerCase().includes(branchQuery)
      );
    }

    // Filter by section (case-insensitive)
    if (filterSection) {
      const sectionQuery = filterSection.toLowerCase();
      filtered = filtered.filter(student => 
        student.section?.toLowerCase().includes(sectionQuery)
      );
    }

    // Filter by has relatives or siblings in Engineering/Professional field
    if (filterHasRelatives) {
      const hasRelatives = filterHasRelatives === 'yes';
      filtered = filtered.filter(student => 
        (student.hasRelativesInIT === hasRelatives) || (student.hasSiblingsInIT === hasRelatives)
      );
    }

    // Filter by relative's city (case-insensitive with fuzzy matching - both relatives and siblings)
    if (filterCity) {
      const cityQuery = filterCity.toLowerCase().trim();
      filtered = filtered.filter(student => {
        let hasCityMatch = false;
        
        // Check Professional Contacts (relativesInIT)
        if (student.relativesInIT && student.relativesInIT.length > 0) {
          hasCityMatch = student.relativesInIT.some(rel => 
            rel.workCity?.toLowerCase().trim().replace(/\s+/g, ' ').includes(cityQuery) ||
            cityQuery.includes(rel.workCity?.toLowerCase().trim().replace(/\s+/g, '') || '')
          );
        }
        
        // Check Siblings in Engineering/Professional Field
        if (!hasCityMatch && student.hasSiblingsInIT && student.siblings && student.siblings.length > 0) {
          hasCityMatch = student.siblings.some(sibling => 
            sibling.city?.toLowerCase().trim().replace(/\s+/g, ' ').includes(cityQuery) ||
            cityQuery.includes(sibling.city?.toLowerCase().trim().replace(/\s+/g, '') || '')
          );
        }
        
        return hasCityMatch;
      });
    }

    // Filter by relative's designation (case-insensitive with fuzzy matching - both relatives and siblings)
    if (filterDesignation) {
      const designationQuery = filterDesignation.toLowerCase().trim();
      filtered = filtered.filter(student => {
        // Check Professional Contacts (relativesInIT)
        const hasRelativeMatch = student.relativesInIT?.some(rel => 
          rel.designation?.toLowerCase().trim().replace(/\s+/g, ' ').includes(designationQuery)
        );
        
        // Check Siblings in Engineering/Professional Field
        const hasSiblingMatch = student.hasSiblingsInIT && student.siblings?.some(sibling => 
          sibling.designation?.toLowerCase().trim().replace(/\s+/g, ' ').includes(designationQuery)
        );
        
        return hasRelativeMatch || hasSiblingMatch;
      });
    }

    // Filter by company (case-insensitive - both relatives and siblings)
    if (filterCompany) {
      const companyQuery = filterCompany.toLowerCase();
      filtered = filtered.filter(student => {
        // Check Professional Contacts (relativesInIT)
        const hasRelativeMatch = student.relativesInIT?.some(rel => 
          rel.company?.toLowerCase().includes(companyQuery)
        );
        
        // Check Siblings in Engineering/Professional Field
        const hasSiblingMatch = student.siblings?.some(sibling => 
          sibling.company?.toLowerCase().includes(companyQuery)
        );
        
        return hasRelativeMatch || hasSiblingMatch;
      });
    }

    setFilteredStudents(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterBranch('');
    setFilterSection('');
    setFilterHasRelatives('');
    setFilterCity('');
    setFilterDesignation('');
    setFilterCompany('');
    setBranchInput('');
    setSectionInput('');
    setCityInput('');
    setDesignationInput('');
    setCurrentPage(1);
  };

  // Logout function
  const handleLogout = async () => {
    await auth.signOut();
    navigate('/faculty/login');
  };

  // Delete student function
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}'s record? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
        // Refresh the student list
        fetchStudents();
        // Close modal if it's open
        if (showModal) {
          handleCloseModal();
        }
        alert('Student record deleted successfully');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student record. Please try again.');
      }
    }
  };

  // Open modal to view student details
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };
  
  // Autocomplete handlers
  const handleBranchSelect = (branch: string) => {
    setFilterBranch(branch);
    setBranchInput(branch);
    setShowBranchDropdown(false);
  };
  
  const handleSectionSelect = (section: string) => {
    setFilterSection(section);
    setSectionInput(section);
    setShowSectionDropdown(false);
  };
  
  const handleCitySelect = (city: string) => {
    setFilterCity(city);
    setCityInput(city);
    setShowCityDropdown(false);
  };
  
  const handleDesignationSelect = (designation: string) => {
    setFilterDesignation(designation);
    setDesignationInput(designation);
    setShowDesignationDropdown(false);
  };
  
  // Initialize input values when filters change
  useEffect(() => {
    if (filterBranch && !branchInput) {
      setBranchInput(filterBranch);
    }
  }, [filterBranch, branchInput]);
  
  useEffect(() => {
    if (filterSection && !sectionInput) {
      setSectionInput(filterSection);
    }
  }, [filterSection, sectionInput]);
  
  useEffect(() => {
    if (filterCity && !cityInput) {
      setCityInput(filterCity);
    }
  }, [filterCity, cityInput]);
  
  useEffect(() => {
    if (filterDesignation && !designationInput) {
      setDesignationInput(filterDesignation);
    }
  }, [filterDesignation, designationInput]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowBranchDropdown(false);
      setShowSectionDropdown(false);
      setShowCityDropdown(false);
      setShowDesignationDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredStudents.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const headers = ['Student Name', 'Roll Number', 'Branch', 'Year', 'Mobile', 'Email', 'Has Relatives in IT', 'Relative Name', 'Company', 'Designation', 'City', 'Contact'];
    const rows = filteredStudents.flatMap(student => {
      if (student.relativesInIT && student.relativesInIT.length > 0) {
        return student.relativesInIT.map(rel => [
          student.studentName,
          student.rollNumber,
          student.branch,
          student.year,
          student.mobileNo,
          student.collegeMail,
          'Yes',
          rel.name,
          rel.company,
          rel.designation,
          rel.workCity,
          rel.contactNumber
        ]);
      } else {
        return [[
          student.studentName,
          student.rollNumber,
          student.branch,
          student.year,
          student.mobileNo,
          student.collegeMail,
          'No',
          '-',
          '-',
          '-',
          '-',
          '-'
        ]];
      }
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="dashboard-subtitle">PSGiTech Student Information Portal</p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {students.filter(s => s.hasRelativesInIT || s.hasSiblingsInIT).length}
            </div>
            <div className="stat-label">Students with Professional Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {students.reduce((acc, s) => acc + (s.relativesInIT?.length || 0) + (s.siblings?.length || 0), 0)}
            </div>
            <div className="stat-label">Total Professional Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{filteredStudents.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <h2>Filters</h2>
          
          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search by name, roll number, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Branch Filter - Autocomplete */}
            <div className="filter-group">
              <label>Branch</label>
              <div className="autocomplete-container">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Type or select branch..."
                  value={branchInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBranchInput(value);
                    setFilterBranch(value);
                    setShowBranchDropdown(true);
                  }}
                  onFocus={() => setShowBranchDropdown(true)}
                  onClick={(e) => e.stopPropagation()}
                />
                {showBranchDropdown && filteredBranches.length > 0 && (
                  <div className="autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {filteredBranches.map(branch => (
                      <div
                        key={branch}
                        className="autocomplete-item"
                        onClick={() => handleBranchSelect(branch)}
                      >
                        {branch}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section Filter - Autocomplete */}
            <div className="filter-group">
              <label>Section</label>
              <div className="autocomplete-container">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Type or select section..."
                  value={sectionInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSectionInput(value);
                    setFilterSection(value);
                    setShowSectionDropdown(true);
                  }}
                  onFocus={() => setShowSectionDropdown(true)}
                  onClick={(e) => e.stopPropagation()}
                />
                {showSectionDropdown && filteredSections.length > 0 && (
                  <div className="autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {filteredSections.map(section => (
                      <div
                        key={section}
                        className="autocomplete-item"
                        onClick={() => handleSectionSelect(section)}
                      >
                        {section}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Has Professional Contacts Filter */}
            <div className="filter-group">
              <label>Has Professional Contacts</label>
              <select
                className="filter-input"
                value={filterHasRelatives}
                onChange={(e) => setFilterHasRelatives(e.target.value)}
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Company Filter - Text Input */}
            <div className="filter-group">
              <label>Company</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search company name..."
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              />
            </div>

            {/* Designation Filter - Autocomplete */}
            <div className="filter-group">
              <label>Designation</label>
              <div className="autocomplete-container">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Type or select designation..."
                  value={designationInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDesignationInput(value);
                    setFilterDesignation(value);
                    setShowDesignationDropdown(true);
                  }}
                  onFocus={() => setShowDesignationDropdown(true)}
                  onClick={(e) => e.stopPropagation()}
                />
                {showDesignationDropdown && filteredDesignations.length > 0 && (
                  <div className="autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {filteredDesignations.map((designation) => {
                      const isCustom = !availableDesignations.includes(designation);
                      return (
                        <div
                          key={designation}
                          className={`autocomplete-item ${isCustom ? 'custom-option' : ''}`}
                          onClick={() => handleDesignationSelect(designation)}
                        >
                          {designation}
                          {isCustom && <span className="custom-indicator"> (Custom)</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* City Filter - Autocomplete */}
            <div className="filter-group">
              <label>Work City</label>
              <div className="autocomplete-container">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Type or select city..."
                  value={cityInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCityInput(value);
                    setFilterCity(value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  onClick={(e) => e.stopPropagation()}
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {filteredCities.map((city) => {
                      const isCustom = !availableCities.includes(city);
                      return (
                        <div
                          key={city}
                          className={`autocomplete-item ${isCustom ? 'custom-option' : ''}`}
                          onClick={() => handleCitySelect(city)}
                        >
                          {city}
                          {isCustom && <span className="custom-indicator"> (Custom)</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
            <button className="btn btn-primary" onClick={exportToCSV}>
              Export to CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-section">
          {loading ? (
            <div className="loading">Loading student data...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="no-data">
              <p>No students found matching your filters.</p>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="results-summary">
                <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} results</span>
                <div className="items-per-page">
                  <label>Items per page:</label>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Roll Number</th>
                      <th>Branch</th>
                      <th>Section</th>
                      <th>Year</th>
                      <th>Contact</th>
                      <th>Professional Contacts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="td-name">{student.studentName}</td>
                        <td>{student.rollNumber}</td>
                        <td><span className="badge">{student.branch}</span></td>
                        <td className="td-center">{student.section || '-'}</td>
                        <td>{student.year}</td>
                        <td>
                          <div className="contact-info">
                            <div>{student.mobileNo}</div>
                            <div className="email">{student.collegeMail}</div>
                          </div>
                        </td>
                        <td className="td-center">
                          {student.hasRelativesInIT || student.hasSiblingsInIT ? (
                            <span className="badge badge-success">
                              {(student.relativesInIT?.length || 0) + (student.siblings?.length || 0)} Contact(s)
                            </span>
                          ) : (
                            <span className="badge badge-gray">None</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-view"
                              onClick={() => handleViewDetails(student)}
                            >
                              View
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteStudent(student.id, student.studentName)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`btn ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for viewing student details */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Basic Information */}
              <section className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedStudent.studentName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Roll Number:</span>
                    <span className="detail-value">{selectedStudent.rollNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Branch:</span>
                    <span className="detail-value">{selectedStudent.branch}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Section:</span>
                    <span className="detail-value">{selectedStudent.section || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{selectedStudent.year}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile:</span>
                    <span className="detail-value">{selectedStudent.mobileNo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Parent Mobile:</span>
                    <span className="detail-value">{selectedStudent.parentMobile}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Personal Email:</span>
                    <span className="detail-value">{selectedStudent.personalMail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">College Email:</span>
                    <span className="detail-value">{selectedStudent.collegeMail}</span>
                  </div>
                </div>
              </section>

              {/* Parent Information */}
              <section className="detail-section">
                <h3>Parent / Guardian Information</h3>
                
                {/* Father Details */}
                {selectedStudent.parents && selectedStudent.parents.father && (
                  <div className="card-detail" style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#2c3e50' }}>Father</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value">{selectedStudent.parents.father.status === 'alive' ? 'Alive' : selectedStudent.parents.father.status === 'nil' ? 'Not Applicable' : 'Deceased'}</span>
                      </div>
                      {selectedStudent.parents.father.status === 'alive' && (
                        <>
                          <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{selectedStudent.parents.father.name}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{selectedStudent.parents.father.contactNumber}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{selectedStudent.parents.father.personalEmail || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Education:</span>
                            <span className="detail-value">{selectedStudent.parents.father.education}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Occupation Type:</span>
                            <span className="detail-value">{selectedStudent.parents.father.occupationType}</span>
                          </div>
                          {selectedStudent.parents.father.occupationType === 'employed' && (
                            <>
                              <div className="detail-item">
                                <span className="detail-label">Organization:</span>
                                <span className="detail-value">{selectedStudent.parents.father.organizationName}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Designation:</span>
                                <span className="detail-value">{selectedStudent.parents.father.designation}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Office Contact:</span>
                                <span className="detail-value">{selectedStudent.parents.father.officeContactNumber}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Office Email:</span>
                                <span className="detail-value">{selectedStudent.parents.father.officeEmail}</span>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Mother Details */}
                {selectedStudent.parents && selectedStudent.parents.mother && (
                  <div className="card-detail" style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#2c3e50' }}>Mother</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value">{selectedStudent.parents.mother.status === 'alive' ? 'Alive' : selectedStudent.parents.mother.status === 'nil' ? 'Not Applicable' : 'Deceased'}</span>
                      </div>
                      {selectedStudent.parents.mother.status === 'alive' && (
                        <>
                          <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{selectedStudent.parents.mother.name}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{selectedStudent.parents.mother.contactNumber}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{selectedStudent.parents.mother.personalEmail || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Education:</span>
                            <span className="detail-value">{selectedStudent.parents.mother.education}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Occupation Type:</span>
                            <span className="detail-value">{selectedStudent.parents.mother.occupationType}</span>
                          </div>
                          {selectedStudent.parents.mother.occupationType === 'employed' && (
                            <>
                              <div className="detail-item">
                                <span className="detail-label">Organization:</span>
                                <span className="detail-value">{selectedStudent.parents.mother.organizationName}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Designation:</span>
                                <span className="detail-value">{selectedStudent.parents.mother.designation}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Office Contact:</span>
                                <span className="detail-value">{selectedStudent.parents.mother.officeContactNumber}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Office Email:</span>
                                <span className="detail-value">{selectedStudent.parents.mother.officeEmail}</span>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Guardian Details */}
                {selectedStudent.parents && selectedStudent.parents.guardian && (
                  <div className="card-detail" style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#2c3e50' }}>Guardian</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value">{selectedStudent.parents.guardian.status === 'alive' ? 'Alive' : selectedStudent.parents.guardian.status === 'nil' ? 'Not Applicable' : 'Deceased'}</span>
                      </div>
                      {selectedStudent.parents.guardian.status === 'alive' && (
                        <>
                          <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{selectedStudent.parents.guardian.name}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{selectedStudent.parents.guardian.contactNumber}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{selectedStudent.parents.guardian.personalEmail || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Education:</span>
                            <span className="detail-value">{selectedStudent.parents.guardian.education}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Occupation Type:</span>
                            <span className="detail-value">{selectedStudent.parents.guardian.occupationType}</span>
                          </div>
                          {selectedStudent.parents.guardian.occupationType === 'employed' && (
                            <>
                              <div className="detail-item">
                                <span className="detail-label">Organization:</span>
                                <span className="detail-value">{selectedStudent.parents.guardian.organizationName}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Designation:</span>
                                <span className="detail-value">{selectedStudent.parents.guardian.designation}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Office Contact:</span>
                                <span className="detail-value">{selectedStudent.parents.guardian.officeContactNumber}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Office Email:</span>
                                <span className="detail-value">{selectedStudent.parents.guardian.officeEmail}</span>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Siblings in Engineering/Professional field */}
              {selectedStudent.hasSiblingsInIT && selectedStudent.siblings && selectedStudent.siblings.length > 0 && (
                <section className="detail-section">
                  <h3>Siblings in Engineering/Professional Field</h3>
                  {selectedStudent.siblings.map((sibling, index) => (
                    <div key={index} className="card-detail">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Name:</span>
                          <span className="detail-value">{sibling.name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Education:</span>
                          <span className="detail-value">{sibling.education}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Company:</span>
                          <span className="detail-value">{sibling.company}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Designation:</span>
                          <span className="detail-value">{sibling.designation}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">City:</span>
                          <span className="detail-value">{sibling.city}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Professional Contacts */}
              {selectedStudent.hasRelativesInIT && selectedStudent.relativesInIT && selectedStudent.relativesInIT.length > 0 && (
                <section className="detail-section">
                  <h3>Professional Contacts (Engineering/Related Fields)</h3>
                  {selectedStudent.relativesInIT.map((relative, index) => (
                    <div key={index} className="card-detail">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Name:</span>
                          <span className="detail-value">{relative.name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Gender:</span>
                          <span className="detail-value">{relative.gender}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Relationship:</span>
                          <span className="detail-value">{relative.relationship}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Company:</span>
                          <span className="detail-value">{relative.company}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Designation:</span>
                          <span className="detail-value">{relative.designation}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Work City:</span>
                          <span className="detail-value">{relative.workCity}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Contact:</span>
                          <span className="detail-value">{relative.contactNumber}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{relative.email}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Experience:</span>
                          <span className="detail-value">{relative.yearsOfExperience} years</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Show message if no relatives */}
              {!selectedStudent.hasRelativesInIT && (
                <section className="detail-section">
                  <h3>Professional Contacts</h3>
                  <p className="no-data-message">No professional contacts in engineering or related fields.</p>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;
