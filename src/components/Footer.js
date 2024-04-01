import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel } from '@fortawesome/free-solid-svg-icons';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`footer mt-5 py-4 ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <hr className={`mb-4 ${darkMode ? 'dark-hr' : ''}`} />
            <p>
              <FontAwesomeIcon icon={faGavel}/> &nbsp; HAPPY BIDDING &nbsp; <FontAwesomeIcon icon={faGavel}/>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;