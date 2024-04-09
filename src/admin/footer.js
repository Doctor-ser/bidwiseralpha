import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools } from '@fortawesome/free-solid-svg-icons'; // Using a more admin-themed icon

const AdminFooter = ({ darkMode }) => {
  return (
    <footer className={`footer mt-5 py-4 ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <hr className={`mb-4 ${darkMode ? 'dark-hr' : ''}`} />
            <p>
              <FontAwesomeIcon icon={faTools} /> &nbsp; ADMIN PANEL &nbsp; <FontAwesomeIcon icon={faTools} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
