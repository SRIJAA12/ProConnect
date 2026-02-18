# 🎓 PSGiTech Student Portal

A modern web application for managing student information and connecting with IT industry professionals through student networks at PSG Institute of Technology.

## 📋 Features

### For Faculty
- ✅ Secure authentication with @psgitech.ac.in email
- 📊 View all student submissions in a dashboard
- 🔍 Advanced filtering by:
  - Branch (CSE, IT, ECE, etc.)
  - Students with IT connections
  - Relative's company, designation, or city
  - Global search across all fields
- 📥 Export filtered data to CSV
- 📈 Real-time statistics

### For Students
- 📝 Google Forms-style multi-step form
- 👨‍👩‍👧‍👦 Parent information collection
- 👥 Siblings in IT sector details
- 🤝 Relatives/Friends/Neighbors in IT/CS field
  - Name, gender, relationship
  - Company, designation, work city
  - Contact details (phone & email)
  - Years of experience
- 🎓 Academic achievements (optional)
- ✅ Form validation and user-friendly error messages

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Modern styling

### Backend
- **Firebase Authentication** - Secure user authentication
- **Firestore** - NoSQL cloud database
- **Firebase Hosting** - Deployment (optional)

## 📁 Project Structure

```
student-portal/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── pages/
│   │   ├── FacultyLogin.tsx     # Faculty login page
│   │   ├── FacultySignup.tsx    # Faculty registration
│   │   ├── FacultyDashboard.tsx # Faculty dashboard with filters
│   │   └── StudentForm.tsx      # Student data submission form
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Main app component with routing
│   ├── App.css                  # Global app styles
│   ├── main.tsx                 # App entry point
│   └── index.css                # Global CSS reset
├── index.html                   # HTML template
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── LEARNING_GUIDE.md            # Comprehensive React learning guide
├── FIREBASE_SETUP.md            # Step-by-step Firebase setup
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Firebase account** - [Sign up here](https://firebase.google.com/)
- **Code editor** - VS Code recommended

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd d:\student-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (Important!)
   - Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Copy your Firebase config
   - Update `src/config/firebase.ts` with your credentials

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to: http://localhost:5174
   - You should see the faculty login page

## 🎯 Usage Guide

### For Faculty

1. **First Time Setup**
   - Go to http://localhost:5174/faculty/signup
   - Enter your employee ID (e.g., FAC001)
   - Enter your PSGiTech email (must end with @psgitech.ac.in)
   - Set a password (minimum 6 characters)
   - Click "Sign Up"

2. **Login**
   - Go to http://localhost:5174/faculty/login
   - Enter your employee ID or email
   - Enter your password
   - Click "Login"

3. **View Student Data**
   - After login, you'll see the dashboard
   - View statistics at the top
   - Use filters to find specific students
   - Click "View" to see detailed information

4. **Filter Students**
   - **Search**: Type student name, roll number, or email
   - **Branch**: Select specific branch (CSE, IT, ECE, etc.)
   - **Has IT Relatives**: Filter students with/without IT connections
   - **Company**: Filter by relative's company
   - **Designation**: Filter by relative's job title
   - **Work City**: Filter by city where relative works

5. **Export Data**
   - Apply desired filters
   - Click "Export to CSV"
   - Opens in Excel/Google Sheets

### For Students

1. **Access the Form**
   - Go to: http://localhost:5174/student/form
   - No login required

2. **Fill the Form**
   - **Step 1**: Basic Information
     - Name, roll number, branch, year
     - Mobile numbers, email addresses
   
   - **Step 2**: Parent Details
     - Mother's and father's information
     - Education and occupation
   
   - **Step 3**: Siblings in IT (if any)
     - Name, education, company, designation, city
     - Can add multiple siblings
   
   - **Step 4**: Relatives/Friends/Neighbors in IT
     - Full details of IT connections
     - Name, gender, relationship
     - Company, designation, city
     - Contact information
     - Can add multiple contacts
   
   - **Step 5**: Academic Details (optional)
     - Can be skipped

3. **Submit**
   - Click "Submit Form" on the last step
   - You'll see a success message
   - Data is now visible in faculty dashboard

## 🎨 Customization

### Change Colors

Edit `src/pages/*.css` files:

```css
/* Change primary color */
.btn-primary {
  background: #your-color-here;
}

/* Change header gradient */
.dashboard-header {
  background: linear-gradient(135deg, #color1, #color2);
}
```

### Add New Fields

1. Update TypeScript interface in `src/types/index.ts`
2. Add state in `StudentForm.tsx`
3. Add input field in the form
4. Include in submission data

### Modify Branches

Edit in `StudentForm.tsx`:

```typescript
<select>
  <option value="Your Branch">Your Branch Name</option>
</select>
```

## 📚 Learning Resources

- **New to React?** Read [LEARNING_GUIDE.md](./LEARNING_GUIDE.md) for comprehensive explanations
- **Setting up Firebase?** Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Firebase Docs**: https://firebase.google.com/docs

## 🐛 Troubleshooting

### Port Already in Use

If you see "Port 5173 is in use":
- App will automatically use next available port (5174, 5175, etc.)
- Or kill the process using that port

### Firebase Errors

**"unauthorized-domain"**
- Add your domain to Firebase Console → Authentication → Authorized domains

**"Missing permissions"**
- Check Firestore security rules
- Make sure you're authenticated

**"Email already in use"**
- That email is already registered
- Try logging in instead

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` folder.

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize hosting:
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Public directory: `dist`
   - Single-page app: `Yes`
   - GitHub integration: Optional

4. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

Your app will be live at: `https://your-project.web.app`

## 🔐 Security Considerations

### Before Going Live

1. **Update Firestore Rules** (Very Important!)
   - Don't use test mode in production
   - See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for secure rules

2. **Email Verification**
   - Add email verification for faculty signup

3. **Environment Variables**
   - Don't commit Firebase config to public repos
   - Use environment variables

4. **Rate Limiting**
   - Implement rate limiting for form submissions
   - Prevent spam and abuse

## 📈 Future Enhancements

- [ ] Email verification for faculty
- [ ] Password reset functionality
- [ ] Faculty admin panel
- [ ] Bulk student data upload (Excel)
- [ ] Advanced analytics and charts
- [ ] Student profile editing
- [ ] File upload support (resumes, certificates)
- [ ] Email notifications
- [ ] Dark mode
- [ ] Mobile responsive improvements

## 🤝 Contributing

Improvements are welcome! Some ideas:

- Add unit tests
- Improve accessibility
- Add more filter options
- Enhance UI/UX
- Add data visualization

## 📝 License

This project is created for PSG Institute of Technology.

## 👨‍💻 Developer Notes

Built with ❤️ using React and Firebase.

**Key Design Decisions:**
- Multi-step form for better UX
- Real-time filtering for instant results
- No server needed - Firebase handles everything
- TypeScript for type safety
- Componentized architecture for reusability

## 📞 Support

For questions or issues:
1. Check [LEARNING_GUIDE.md](./LEARNING_GUIDE.md)
2. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
3. Review console errors in browser (F12)
4. Check Firebase Console for database/auth issues

---

**Made for PSGiTech** | **Computer Science Department** | **2026**
#
