// Student Form - Google Forms Style Multi-Step Form
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Student, RelativeInIT } from '../types';
import './StudentForm.css';

// This component creates a multi-step form for students to fill their details
function StudentForm() {
  // Step tracking: which section of the form are we on?
  // Steps: 0=Basic Info, 1=Parent Details, 2=Siblings, 3=Relatives, 4=Academic, 5=Success
  const [currentStep, setCurrentStep] = useState(0);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form data states - broken down by section
  
  // Step 1: Basic Information
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [personalMail, setPersonalMail] = useState('');
  const [collegeMail, setCollegeMail] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');

  // Step 2: Parent Information
  const [motherName, setMotherName] = useState('');
  const [motherEducation, setMotherEducation] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [fatherEducation, setFatherEducation] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');

  // Step 3: Siblings in IT
  const [hasSiblingsInIT, setHasSiblingsInIT] = useState(false);
  const [siblings, setSiblings] = useState<any[]>([]);

  // Step 4: Relatives/Friends/Neighbors in IT
  const [hasRelativesInIT, setHasRelativesInIT] = useState(false);
  const [relativesInIT, setRelativesInIT] = useState<RelativeInIT[]>([]);

  // Step 5: Academic Details
  const [internships, setInternships] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // List of steps for navigation
  const steps = [
    'Basic Information',
    'Parent Details',
    'Siblings in IT',
    'Relatives in IT/CS',
    'Academic Details'
  ];

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
        if (!studentName || !rollNumber || !mobileNo || !collegeMail || !branch || !year) {
          setError('Please fill all required fields');
          return false;
        }
        if (!collegeMail.endsWith('@psgitech.ac.in')) {
          setError('College email must end with @psgitech.ac.in');
          return false;
        }
        break;
      case 1: // Parent Details
        if (!motherName || !fatherName) {
          setError('Please fill all required parent details');
          return false;
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
      // Prepare the student data object
      const studentData: Partial<Student> = {
        studentName,
        rollNumber,
        mobileNo,
        parentMobile,
        personalMail,
        collegeMail,
        branch,
        year,
        motherName,
        motherEducation,
        motherOccupation,
        fatherName,
        fatherEducation,
        fatherOccupation,
        hasSiblingsInIT,
        siblings,
        hasRelativesInIT,
        relativesInIT,
        internships,
        awards,
        certificates,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add document to Firestore 'students' collection
      await addDoc(collection(db, 'students'), studentData);
      
      setSubmitSuccess(true);
      setCurrentStep(5); // Move to success page
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
        return renderAcademicDetails();
      case 5:
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
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Branch *</label>
          <select
            className="form-input"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">Select Branch</option>
            <option value="CSE">Computer Science Engineering</option>
            <option value="IT">Information Technology</option>
            <option value="ECE">Electronics and Communication</option>
            <option value="EEE">Electrical and Electronics</option>
            <option value="MECH">Mechanical Engineering</option>
            <option value="CIVIL">Civil Engineering</option>
            <option value="AIDS">Artificial Intelligence and Data Science</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Year *</label>
          <select
            className="form-input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select Year</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Final Year">Final Year</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Mobile Number *</label>
        <input
          type="tel"
          className="form-input"
          placeholder="10-digit mobile number"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Parent Mobile Number</label>
        <input
          type="tel"
          className="form-input"
          placeholder="Parent's mobile number"
          value={parentMobile}
          onChange={(e) => setParentMobile(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Personal Email</label>
        <input
          type="email"
          className="form-input"
          placeholder="your.email@gmail.com"
          value={personalMail}
          onChange={(e) => setPersonalMail(e.target.value)}
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
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Education</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., B.E, M.Sc, PhD"
            value={motherEducation}
            onChange={(e) => setMotherEducation(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Occupation</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Teacher, Engineer"
            value={motherOccupation}
            onChange={(e) => setMotherOccupation(e.target.value)}
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
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Education</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., B.E, M.Sc, PhD"
            value={fatherEducation}
            onChange={(e) => setFatherEducation(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Occupation</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Doctor, Business"
            value={fatherOccupation}
            onChange={(e) => setFatherOccupation(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Siblings in IT
  const renderSiblingsSection = () => (
    <div className="form-section">
      <h2>Siblings in IT/Computer Science</h2>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={hasSiblingsInIT}
            onChange={(e) => {
              setHasSiblingsInIT(e.target.checked);
              if (!e.target.checked) setSiblings([]);
            }}
          />
          <span>I have siblings working in IT/CS field</span>
        </label>
      </div>

      {hasSiblingsInIT && (
        <>
          {siblings.map((sibling, index) => (
            <div key={index} className="dynamic-section">
              <h3>Sibling {index + 1}</h3>
              
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={sibling.name}
                  onChange={(e) => updateSibling(index, 'name', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., B.Tech, M.Tech"
                    value={sibling.education}
                    onChange={(e) => updateSibling(index, 'education', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Google, TCS"
                    value={sibling.company}
                    onChange={(e) => updateSibling(index, 'company', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Software Engineer"
                    value={sibling.designation}
                    onChange={(e) => updateSibling(index, 'designation', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Bangalore, Chennai"
                    value={sibling.city}
                    onChange={(e) => updateSibling(index, 'city', e.target.value)}
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

          <button
            type="button"
            className="btn btn-secondary"
            onClick={addSibling}
          >
            + Add Another Sibling
          </button>
        </>
      )}
    </div>
  );

  // Step 4: Relatives/Friends/Neighbors in IT (Most Important Section!)
  const renderRelativesSection = () => (
    <div className="form-section">
      <h2>Relatives/Friends/Neighbors in IT/CS Field</h2>
      <p className="section-description">
        Please provide details of any relatives, family friends, or neighbors working in IT/Computer Science field.
        This helps us build a network for internships, guest lectures, and career guidance.
      </p>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={hasRelativesInIT}
            onChange={(e) => {
              setHasRelativesInIT(e.target.checked);
              if (!e.target.checked) setRelativesInIT([]);
            }}
          />
          <span>I have relatives/friends/neighbors in IT/CS field</span>
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
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-input"
                    value={relative.gender}
                    onChange={(e) => updateRelative(index, 'gender', e.target.value)}
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
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Google, TCS, Infosys, Own Business"
                    value={relative.company}
                    onChange={(e) => updateRelative(index, 'company', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation/Role *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Software Engineer, Tech Lead, CTO"
                    value={relative.designation}
                    onChange={(e) => updateRelative(index, 'designation', e.target.value)}
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
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={relative.yearsOfExperience}
                    onChange={(e) => updateRelative(index, 'yearsOfExperience', parseInt(e.target.value) || 0)}
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
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={relative.email}
                    onChange={(e) => updateRelative(index, 'email', e.target.value)}
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

          <button
            type="button"
            className="btn btn-secondary"
            onClick={addRelative}
          >
            + Add Another Contact
          </button>
        </>
      )}
    </div>
  );

  // Step 5: Academic Details (Optional)
  const renderAcademicDetails = () => (
    <div className="form-section">
      <h2>Academic Details (Optional)</h2>
      <p className="section-description">
        You can skip this section if you don't have any internships, awards, or certificates yet.
      </p>
      
      <div className="optional-note">
        <p>This section is optional and can be filled later. Click "Submit Form" to complete.</p>
      </div>
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
          {currentStep < 5 && (
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

              {currentStep < 4 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nextStep}
                >
                  Next
                </button>
              )}

              {currentStep === 4 && (
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
