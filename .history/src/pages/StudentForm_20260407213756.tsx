// Student Form - Google Forms Style Multi-Step Form
import { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Student, RelativeInIT, ParentDetails } from '../types';
import './StudentForm.css';

// This component creates a multi-step form for students to fill their details
function StudentForm() {
  // Step tracking: which section of the form are we on?
  // Steps: 0=Basic Info, 1=Parent Details, 2=Siblings, 3=Relatives, 4=Success
  const [currentStep, setCurrentStep] = useState(0);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data states - broken down by section
  
  // Step 1: Basic Information
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [personalMail, setPersonalMail] = useState('');
  const [collegeMail, setCollegeMail] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [year, setYear] = useState('');

  // Step 2: Parent Information
  const defaultParentState: ParentDetails = {
    status: 'alive',
    name: '',
    contactNumber: '',
    whatsappNumber: '',
    personalEmail: '',
    education: '',
    occupationType: '',
    previousOccupation: '',
    employmentType: '',
    organizationName: '',
    sector: '',
    designation: '',
    yearsOfExperience: 0,
    officeAddress: '',
    officeContactNumber: '',
    officeEmail: '',
    businessName: '',
    businessType: '',
    businessIndustry: '',
    businessRole: '',
    businessAddress: ''
  };

  const [mother, setMother] = useState<ParentDetails>(defaultParentState);
  const [father, setFather] = useState<ParentDetails>(defaultParentState);
  const [guardian, setGuardian] = useState<ParentDetails | null>(null);
  const [hasGuardian, setHasGuardian] = useState(false);

  // Step 3: Siblings in Engineering field
  const [hasSiblingsInIT, setHasSiblingsInIT] = useState(false);
  const [siblings, setSiblings] = useState<any[]>([]);

  // Step 4: Relatives/Friends/Neighbors in Engineering field
  const [hasRelativesInIT, setHasRelativesInIT] = useState(false);
  const [relativesInIT, setRelativesInIT] = useState<RelativeInIT[]>([]);

  // List of steps for navigation
  const steps = [
    'Basic Information',
    'Parent Details',
    'Siblings in Engineering',
    'Professional Contacts'
  ];

  // Function to check if roll number already exists
  const checkRollNumberExists = async (rollNum: string): Promise<boolean> => {
    try {
      const q = query(collection(db, 'students'), where('rollNumber', '==', rollNum));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (err) {
      console.error('Error checking roll number:', err);
      return false;
    }
  };

  // Function to add a new relative to the list
  const addRelative = () => {
    setRelativesInIT([...relativesInIT, {
      name: '',
      gender: 'Male',
      relationship: '',
      company: '',
      designation: '',
      contactNumber: '',
      email: '',
      workCity: '',
      yearsOfExperience: 0
    }]);
  };

  // Function to remove a relative from the list
  const removeRelative = (index: number) => {
    const updated = relativesInIT.filter((_, i) => i !== index);
    setRelativesInIT(updated);
  };

  // Function to update a specific relative's field
  const updateRelative = (index: number, field: keyof RelativeInIT, value: any) => {
    const updated = [...relativesInIT];
    updated[index] = { ...updated[index], [field]: value };
    setRelativesInIT(updated);
  };

  // Function to add a new sibling
  const addSibling = () => {
    setSiblings([...siblings, {
      name: '',
      education: '',
      company: '',
      designation: '',
      city: ''
    }]);
  };

  // Function to remove a sibling
  const removeSibling = (index: number) => {
    setSiblings(siblings.filter((_, i) => i !== index));
  };

  // Function to update a sibling's field
  const updateSibling = (index: number, field: string, value: string) => {
    const updated = [...siblings];
    updated[index] = { ...updated[index], [field]: value };
    setSiblings(updated);
  };

  // Validation function for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Information
        if (!studentName || !rollNumber || !mobileNo || !parentMobile || !personalMail || !collegeMail || !branch || !section || !year) {
          setError('Please fill all required fields');
          return false;
        }
        if (!collegeMail.endsWith('@psgitech.ac.in')) {
          setError('College email must end with @psgitech.ac.in');
          return false;
        }
        break;
      case 1: // Parent Details
        // Validate Mother
        if (!mother.status) {
          setError('Please select mother status (Alive/Nil/Deceased)');
          return false;
        }
        if (mother.status === 'alive') {
          if (!mother.name || !mother.contactNumber || !mother.education || !mother.occupationType) {
            setError('Please fill all required mother details');
            return false;
          }
          if (mother.occupationType === 'employed') {
            if (!mother.employmentType || !mother.organizationName || !mother.sector || !mother.designation || !mother.officeAddress || !mother.officeContactNumber || !mother.officeEmail) {
              setError('Please fill all required mother employment details');
              return false;
            }
          } else if (mother.occupationType === 'self-employed') {
            if (!mother.businessName || !mother.businessType || !mother.businessIndustry || !mother.businessRole || !mother.businessAddress) {
              setError('Please fill all required mother business details');
              return false;
            }
          }
        }

        // Validate Father
        if (!father.status) {
          setError('Please select father status (Alive/Nil/Deceased)');
          return false;
        }
        if (father.status === 'alive') {
          if (!father.name || !father.contactNumber || !father.education || !father.occupationType) {
            setError('Please fill all required father details');
            return false;
          }
          if (father.occupationType === 'employed') {
            if (!father.employmentType || !father.organizationName || !father.sector || !father.designation || !father.officeAddress || !father.officeContactNumber || !father.officeEmail) {
              setError('Please fill all required father employment details');
              return false;
            }
          } else if (father.occupationType === 'self-employed') {
            if (!father.businessName || !father.businessType || !father.businessIndustry || !father.businessRole || !father.businessAddress) {
              setError('Please fill all required father business details');
              return false;
            }
          }
        }

        // Validate Guardian if present
        if (hasGuardian && guardian) {
          if (!guardian.status) {
            setError('Please select guardian status');
            return false;
          }
          if (guardian.status === 'alive') {
            if (!guardian.name || !guardian.contactNumber || !guardian.education || !guardian.occupationType) {
              setError('Please fill all required guardian details');
              return false;
            }
            if (guardian.occupationType === 'employed') {
              if (!guardian.employmentType || !guardian.organizationName || !guardian.sector || !guardian.designation || !guardian.officeAddress || !guardian.officeContactNumber || !guardian.officeEmail) {
                setError('Please fill all required guardian employment details');
                return false;
              }
            } else if (guardian.occupationType === 'self-employed') {
              if (!guardian.businessName || !guardian.businessType || !guardian.businessIndustry || !guardian.businessRole || !guardian.businessAddress) {
                setError('Please fill all required guardian business details');
                return false;
              }
            }
          }
        }
        break;
      case 2: // Siblings
        if (hasSiblingsInIT) {
          for (let i = 0; i < siblings.length; i++) {
            if (!siblings[i].name || !siblings[i].education || !siblings[i].company || !siblings[i].designation || !siblings[i].city) {
              setError('Please fill all sibling details');
              return false;
            }
          }
        }
        break;
      case 3: // Professional Contacts
        if (hasRelativesInIT) {
          for (let i = 0; i < relativesInIT.length; i++) {
            if (!relativesInIT[i].name || !relativesInIT[i].relationship || !relativesInIT[i].company || !relativesInIT[i].designation || !relativesInIT[i].workCity || !relativesInIT[i].contactNumber) {
              setError('Please fill all professional contact details');
              return false;
            }
          }
        }
        break;
    }
    setError('');
    return true;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0); // Scroll to top of page
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
    window.scrollTo(0, 0);
  };

  // Submit the entire form to Firebase
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if roll number already exists
      const rollNumberExists = await checkRollNumberExists(rollNumber);
      if (rollNumberExists) {
        setError('This roll number is already registered. Please use a different roll number.');
        setLoading(false);
        return;
      }

      // Prepare the student data object
      const studentData: Partial<Student> = {
        studentName,
        rollNumber,
        mobileNo,
        parentMobile,
        personalMail,
        collegeMail,
        branch,
        section,
        year,
        parents: {
          mother,
          father,
          ...(hasGuardian && guardian ? { guardian } : {})
        },
        hasSiblingsInIT,
        siblings,
        hasRelativesInIT,
        relativesInIT,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add document to Firestore 'students' collection
      await addDoc(collection(db, 'students'), studentData);
      
      setCurrentStep(4); // Move to success page
    } catch (err: any) {
      console.error('Submit error:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render different sections based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderParentDetails();
      case 2:
        return renderSiblingsSection();
      case 3:
        return renderRelativesSection();
      case 4:
        return renderSuccessMessage();
      default:
        return null;
    }
  };

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <div className="form-section">
      <h2>Basic Information</h2>
      
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          type="text"
          className="form-input"
          placeholder="Enter your full name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Roll Number *</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., 22B001"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Branch *</label>
          <select
            className="form-input"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
          >
            <option value="">Select Branch</option>
            <option value="CSE">Computer Science Engineering</option>
            <option value="ECE">Electronics and Communication</option>
            <option value="EEE">Electrical and Electronics</option>
            <option value="ICE">Instrumentation and Control Engineering</option>
            <option value="MECH">Mechanical Engineering</option>
            <option value="CIVIL">Civil Engineering</option>
            <option value="AIDS">Artificial Intelligence and Data Science</option>
            <option value="CSBS">Computer Science and Business Systems</option>
            <option value="VLSI">VLSI</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Section *</label>
          <select
            className="form-input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          >
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Year *</label>
        <select
          className="form-input"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        >
          <option value="">Select Year</option>
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
          <option value="Third Year">Third Year</option>
          <option value="Final Year">Final Year</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Mobile Number *</label>
        <input
          type="tel"
          className="form-input"
          placeholder="10-digit mobile number"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Parent Mobile Number *</label>
        <input
          type="tel"
          className="form-input"
          placeholder="Parent's mobile number"
          value={parentMobile}
          onChange={(e) => setParentMobile(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Personal Email *</label>
        <input
          type="email"
          className="form-input"
          placeholder="your.email@gmail.com"
          value={personalMail}
          onChange={(e) => setPersonalMail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">College Email *</label>
        <input
          type="email"
          className="form-input"
          placeholder="yourname@psgitech.ac.in"
          value={collegeMail}
          onChange={(e) => setCollegeMail(e.target.value)}
          required
        />
        <small className="form-hint">Must end with @psgitech.ac.in</small>
      </div>
    </div>
  );

  // Step 2: Parent Details
  const renderParentDetails = () => (
    <div className="form-section">
      <h2>Parent Information</h2>
      
      <h3 className="subsection-title">Mother's Details</h3>
      <div className="form-group">
        <label className="form-label">Mother's Name *</label>
        <input
          type="text"
          className="form-input"
          value={motherName}
          onChange={(e) => setMotherName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Education *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., B.E, M.Sc, PhD"
            value={motherEducation}
            onChange={(e) => setMotherEducation(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Occupation *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Teacher, Engineer"
            value={motherOccupation}
            onChange={(e) => setMotherOccupation(e.target.value)}
            required
          />
        </div>
      </div>

      <h3 className="subsection-title">Father's Details</h3>
      <div className="form-group">
        <label className="form-label">Father's Name *</label>
        <input
          type="text"
          className="form-input"
          value={fatherName}
          onChange={(e) => setFatherName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Education *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., B.E, M.Sc, PhD"
            value={fatherEducation}
            onChange={(e) => setFatherEducation(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Occupation *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Doctor, Business"
            value={fatherOccupation}
            onChange={(e) => setFatherOccupation(e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Siblings in Engineering/Professional field
  const renderSiblingsSection = () => (
    <div className="form-section">
      <h2>Siblings in Engineering/Professional Field</h2>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={hasSiblingsInIT}
            onChange={(e) => {
              setHasSiblingsInIT(e.target.checked);
              if (!e.target.checked) {
                setSiblings([]);
              } else {
                // Auto-add first sibling form when checkbox is clicked
                if (siblings.length === 0) {
                  addSibling();
                }
              }
            }}
          />
          <span>I have siblings working in Engineering/Professional field</span>
        </label>
      </div>

      {hasSiblingsInIT && (
        <>
          {siblings.map((sibling, index) => (
            <div key={index} className="dynamic-section">
              <h3>Sibling {index + 1}</h3>
              
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={sibling.name}
                  onChange={(e) => updateSibling(index, 'name', e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Education *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., B.Tech, M.Tech, B.E"
                    value={sibling.education}
                    onChange={(e) => updateSibling(index, 'education', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Google, TCS, L&T, BHEL"
                    value={sibling.company}
                    onChange={(e) => updateSibling(index, 'company', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Software Engineer, Design Engineer"
                    value={sibling.designation}
                    onChange={(e) => updateSibling(index, 'designation', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Bangalore, Chennai"
                    value={sibling.city}
                    onChange={(e) => updateSibling(index, 'city', e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeSibling(index)}
              >
                Remove Sibling
              </button>
            </div>
          ))}

          <div className="action-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addSibling}
            >
              + Add Another Sibling
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Step 4: Relatives/Friends/Neighbors in Engineering/Professional Field (Most Important Section!)
  const renderRelativesSection = () => (
    <div className="form-section">
      <h2>Professional Contacts</h2>
      <p className="section-description">
        Please provide details of any relatives, family friends, or neighbors working in Engineering/Professional field
        (IT, CS, ECE, EEE, Mechanical, Civil, etc.). This helps us build a network for internships, guest lectures, and career guidance.
      </p>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={hasRelativesInIT}
            onChange={(e) => {
              setHasRelativesInIT(e.target.checked);
              if (!e.target.checked) {
                setRelativesInIT([]);
              } else {
                // Auto-add first relative form when checkbox is clicked
                if (relativesInIT.length === 0) {
                  addRelative();
                }
              }
            }}
          />
          <span>I have relatives/friends/neighbors in Engineering/Professional field</span>
        </label>
      </div>

      {hasRelativesInIT && (
        <>
          {relativesInIT.map((relative, index) => (
            <div key={index} className="dynamic-section">
              <h3>Contact {index + 1}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={relative.name}
                    onChange={(e) => updateRelative(index, 'name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-input"
                    value={relative.gender}
                    onChange={(e) => updateRelative(index, 'gender', e.target.value)}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Relationship *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Uncle, Aunt, Neighbor, Family Friend, Cousin"
                  value={relative.relationship}
                  onChange={(e) => updateRelative(index, 'relationship', e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Google, TCS, Infosys, L&T, BHEL, Own Business"
                    value={relative.company}
                    onChange={(e) => updateRelative(index, 'company', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation/Role *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Software Engineer, Design Engineer, Project Engineer"
                    value={relative.designation}
                    onChange={(e) => updateRelative(index, 'designation', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Work City *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Bangalore, Chennai, Hyderabad"
                    value={relative.workCity}
                    onChange={(e) => updateRelative(index, 'workCity', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={relative.yearsOfExperience}
                    onChange={(e) => updateRelative(index, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={relative.contactNumber}
                    onChange={(e) => updateRelative(index, 'contactNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={relative.email}
                    onChange={(e) => updateRelative(index, 'email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeRelative(index)}
              >
                Remove Contact
              </button>
            </div>
          ))}

          <div className="action-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addRelative}
            >
              + Add Another Contact
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Success Message
  const renderSuccessMessage = () => (
    <div className="success-container">
      <div className="success-icon">✓</div>
      <h2>Form Submitted Successfully!</h2>
      <p>Thank you for submitting your information. Your data has been recorded.</p>
      <p>The faculty can now view your details in their dashboard.</p>
    </div>
  );

  return (
    <div className="student-form-container">
      {/* Header */}
      <div className="form-header">
        <h1>Student Information Form</h1>
        <p>PSGiTech Computer Science Department - Student Database</p>
      </div>

      {/* Progress indicator */}
      {currentStep < 5 && (
        <div className="progress-container">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              >
                <div className="step-number">{index < currentStep ? '✓' : index + 1}</div>
                <div className="step-label">{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main form content */}
      <div className="form-content">
        <div className="form-card">
          {renderStep()}

          {/* Error message */}
          {error && <div className="error-message">{error}</div>}

          {/* Navigation buttons */}
          {currentStep < 4 && (
            <div className="form-nav-buttons">
              {currentStep > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Previous
                </button>
              )}

              {currentStep < 3 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nextStep}
                >
                  Next
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Form'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentForm;
