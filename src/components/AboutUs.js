import React from 'react';

const AboutUs = ({ darkMode }) => {
  const teamMembers = [
    { name: 'Alfin Joji   ', linkedin: 'www.linkedin.com/in/alfin-joji-736068228/' },
    { name: 'Ashwin V Mathew   ', linkedin: 'www.linkedin.com/in/ashwin-v-mathew' },
    { name: 'Johan George   ', linkedin: 'www.linkedin.com/in/johan-george-kuruvilla-a4927a227' },
    { name: 'Evan T Abraham   ', linkedin: 'www.linkedin.com/in/evan-t-abraham-7696a5227' }
  ];


  return (
    <div className={`container mt-5 ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`card ${darkMode ? 'text-light bg-dark' : ''}`}>
        <div className="card-body">
          <h2 className={`card-title ${darkMode ? 'text-light' : ''}`}>About Us</h2>
          <p className={`card-text ${darkMode ? 'text-light' : ''}`}>
            WE ARE GROUP 9, WORKING ON PROJECT ONLINE AUCTION SYSTEM.
          </p>

          <h4 className={`card-subtitle mb-3 ${darkMode ? 'text-light' : ''}`}>Team Members:</h4>
          <ul className={`list-group ${darkMode ? 'list-group-flush' : ''}`}>
            {teamMembers.map((member) => (
              <li key={member.roll} className={`list-group-item ${darkMode ? 'bg-dark text-light' : ''}`}>
                {member.name} 
                <a href={`https://${member.linkedin}`} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                </a>
              </li>
            ))}
          </ul>

          <div className={`mt-3 ${darkMode ? 'text-light' : ''}`}>
            <h4 className={`mb-3 ${darkMode ? 'text-light' : ''}`}>Tech Stack:</h4>
            <div className="card" style={{ background: darkMode ? '#343a40' : ''}} >
              <div className="card-body" >
                <p className={`card-text ${darkMode ? 'text-light' : 'text-dark'}`}>
                  <strong>Frontend:</strong> HTML, CSS, Bootstrap, JavaScript, React.js <br />
                  <br/> <strong>Backend:</strong> Node.js, Express.js <br />
                  <br/> <strong>Database:</strong> MongoDB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
