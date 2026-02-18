// Faculty Dashboard - View and Filter Student Data
import { useState, useEffect } from 'react';
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

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Get unique values for filter dropdowns
  const [branches] = useState<string[]>([
    'CSE', 'ECE', 'EEE', 'ICE', 'MECH', 'CIVIL', 'AIDS', 'CSBS'
  ]);
  
  // Predefined cities - Major Indian cities
  const [cities] = useState<string[]>([
    'Agra', 'Ahmedabad', 'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai',
    'Coimbatore', 'Delhi', 'Gurgaon', 'Guwahati', 'Hyderabad', 'Indore', 'Jaipur',
    'Kochi', 'Kolkata', 'Lucknow', 'Madurai', 'Mangalore', 'Mumbai', 'Mysore',
    'Nagpur', 'Nashik', 'Noida', 'Patna', 'Pune', 'Rajkot', 'Surat', 'Thiruvananthapuram',
    'Tiruchirappalli', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam'
  ]);
  
  // Predefined designations - All engineering fields
  const [designations] = useState<string[]>([
    // Software/IT
    'Software Engineer', 'Senior Software Engineer', 'Software Developer', 'Full Stack Developer',
    'Frontend Developer', 'Backend Developer', 'Tech Lead', 'Engineering Manager', 'CTO',
    'DevOps Engineer', 'Cloud Engineer', 'Data Engineer', 'Data Scientist', 'ML Engineer',
    'QA Engineer', 'Test Engineer', 'System Administrator', 'Network Engineer',
    // Electronics/ECE
    'Electronics Engineer', 'VLSI Engineer', 'Embedded Engineer', 'Hardware Engineer',
    'RF Engineer', 'Signal Processing Engineer', 'Firmware Engineer', 'PCB Designer',
    // Electrical/EEE
    'Electrical Engineer', 'Power Systems Engineer', 'Control Systems Engineer',
    'Instrumentation Engineer', 'Automation Engineer', 'PLC Programmer',
    // Mechanical
    'Mechanical Engineer', 'Design Engineer', 'CAD Engineer', 'Manufacturing Engineer',
    'Production Engineer', 'Maintenance Engineer', 'Quality Engineer', 'R&D Engineer',
    // Civil
    'Civil Engineer', 'Structural Engineer', 'Site Engineer', 'Project Engineer',
    'Construction Manager', 'Planning Engineer', 'Architect',
    // General
    'Project Manager', 'Technical Consultant', 'Team Lead', 'Senior Engineer',
    'Chief Engineer', 'General Manager', 'Director', 'VP Engineering'
  ]);

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

    // Filter by branch
    if (filterBranch) {
      filtered = filtered.filter(student => student.branch === filterBranch);
    }

    // Filter by section
    if (filterSection) {
      filtered = filtered.filter(student => student.section === filterSection);
    }

    // Filter by has relatives in Engineering/Professional field
    if (filterHasRelatives) {
      const hasRelatives = filterHasRelatives === 'yes';
      filtered = filtered.filter(student => student.hasRelativesInIT === hasRelatives);
    }

    // Filter by relative's city
    if (filterCity) {
      filtered = filtered.filter(student =>
        student.relativesInIT?.some(rel => rel.workCity === filterCity)
      );
    }

    // Filter by relative's designation
    if (filterDesignation) {
      filtered = filtered.filter(student =>
        student.relativesInIT?.some(rel => rel.designation === filterDesignation)
      );
    }

    // Filter by relative's company (case-insensitive)
    if (filterCompany) {
      const companyQuery = filterCompany.toLowerCase();
      filtered = filtered.filter(student =>
        student.relativesInIT?.some(rel => rel.company.toLowerCase().includes(companyQuery))
      );
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
              {students.filter(s => s.hasRelativesInIT).length}
            </div>
            <div className="stat-label">Students with Professional Contacts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {students.reduce((acc, s) => acc + (s.relativesInIT?.length || 0), 0)}
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

            {/* Branch Filter */}
            <div className="filter-group">
              <label>Branch</label>
              <select
                className="filter-input"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div className="filter-group">
              <label>Section</label>
              <select
                className="filter-input"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="">All Sections</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
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

            {/* Designation Filter */}
            <div className="filter-group">
              <label>Designation</label>
              <select
                className="filter-input"
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
              >
                <option value="">All Designations</option>
                {designations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="filter-group">
              <label>Work City</label>
              <select
                className="filter-input"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
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
                  {filteredStudents.map((student) => (
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
                        {student.hasRelativesInIT ? (
                          <span className="badge badge-success">
                            {student.relativesInIT?.length || 0} Contact(s)
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <h3>Parent Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Father's Name:</span>
                    <span className="detail-value">{selectedStudent.fatherName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Father's Education:</span>
                    <span className="detail-value">{selectedStudent.fatherEducation}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Father's Occupation:</span>
                    <span className="detail-value">{selectedStudent.fatherOccupation}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mother's Name:</span>
                    <span className="detail-value">{selectedStudent.motherName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mother's Education:</span>
                    <span className="detail-value">{selectedStudent.motherEducation}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mother's Occupation:</span>
                    <span className="detail-value">{selectedStudent.motherOccupation}</span>
                  </div>
                </div>
              </section>

              {/* Siblings in IT */}
              {selectedStudent.hasSiblingsInIT && selectedStudent.siblings && selectedStudent.siblings.length > 0 && (
                <section className="detail-section">
                  <h3>Siblings in IT</h3>
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

              {/* Relatives in IT */}
              {selectedStudent.hasRelativesInIT && selectedStudent.relativesInIT && selectedStudent.relativesInIT.length > 0 && (
                <section className="detail-section">
                  <h3>Relatives/Friends in IT Field</h3>
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
                  <h3>Relatives/Friends in IT Field</h3>
                  <p className="no-data-message">No relatives or friends in IT field.</p>
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
