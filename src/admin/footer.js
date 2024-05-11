import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools } from '@fortawesome/free-solid-svg-icons'; // Using a more admin-themed icon

const AdminFooter = ({ darkMode }) => {
  return (
    <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
      <section className="container">
        <section className="row" >
          <div className="col-lg-12 text-center">
            <hr style={{margin:"0px"}} className={` ${darkMode ? 'dark-hr' : ''}`} />
            <p style={{margin:"30px"}}>
              <FontAwesomeIcon icon={faTools} /> &nbsp; ADMIN PANEL &nbsp; <FontAwesomeIcon icon={faTools} />
            </p>
          </div>
        </section>
      </section>
    </footer>
  );
};

export default AdminFooter;
