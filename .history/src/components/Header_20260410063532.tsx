import '../styles/Header.css';

function Header() {
  return (
    <header className="psg-header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-section">
            <img src="/images/logo.png" alt="PSG Institute Logo" className="psg-logo" />
          </div>
          <div className="title-section">
            <h1 className="app-title">ProConnect</h1>
            <p className="college-name">PSG INSTITUTE OF TECHNOLOGY AND APPLIED RESEARCH</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
