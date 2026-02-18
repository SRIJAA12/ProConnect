// Faculty Dashboard - View and Filter Student Data
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
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
  const [filterHasRelatives, setFilterHasRelatives] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Get unique values for filter dropdowns
  const [branches, setBranches] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);

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
      
      // Extract unique values for filters
      extractFilterOptions(studentsData);
      
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filter dropdowns
  const extractFilterOptions = (data: Student[]) => {
    // Unique branches
    const uniqueBranches = [...new Set(data.map(s => s.branch).filter(Boolean))];
    setBranches(uniqueBranches);
    
    // Extract all relatives' data
    const allRelatives = data.flatMap(s => s.relativesInIT || []);
    
    // Unique cities
    const uniqueCities = [...new Set(allRelatives.map(r => r.workCity).filter(Boolean))];
    setCities(uniqueCities.sort());
    
    // Unique designations
    const uniqueDesignations = [...new Set(allRelatives.map(r => r.designation).filter(Boolean))];
    setDesignations(uniqueDesignations.sort());
    
    // Unique companies
    const uniqueCompanies = [...new Set(allRelatives.map(r => r.company).filter(Boolean))];
    setCompanies(uniqueCompanies.sort());
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterBranch, filterHasRelatives, filterCity, filterDesignation, filterCompany, students]);

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

    // Filter by has relatives in IT
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

    // Filter by relative's company
    if (filterCompany) {
      filtered = filtered.filter(student =>
        student.relativesInIT?.some(rel => rel.company === filterCompany)
      );
    }

    setFilteredStudents(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterBranch('');
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
            <div className="stat-label">Students with IT Connections</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {students.reduce((acc, s) => acc + (s.relativesInIT?.length || 0), 0)}
            </div>
            <div className="stat-label">Total IT Contacts</div>
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

            {/* Has Relatives Filter */}
            <div className="filter-group">
              <label>Has Relatives in IT</label>
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

            {/* Company Filter */}
            <div className="filter-group">
              <label>Company</label>
              <select
                className="filter-input"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
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
                    <th>Year</th>
                    <th>Contact</th>
                    <th>IT Relatives</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="td-name">{student.studentName}</td>
                      <td>{student.rollNumber}</td>
                      <td><span className="badge">{student.branch}</span></td>
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
                        <button
                          className="btn-view"
                          onClick={() => {
                            // Show detailed view - we'll implement this as a modal
                            alert(`Viewing details for ${student.studentName}\n\nRelatives: ${student.relativesInIT?.map(r => `${r.name} - ${r.company}`).join(', ') || 'None'}`);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
