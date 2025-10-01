import React from 'react';
import "./AboutUS.css";

const AboutUs = ({ darkMode }) => {
  
  return (
    <div>
    <div className={`container mt-5 ${darkMode ? 'dark-mode' : ''}`} style={{paddingLeft:"60px"}}>
      <div className={`card ${darkMode ? 'text-light bg-dark' : ''}`}>
        <div className="card-body">
          {/* Team section start */}
          <section class="team spad" style={{paddingBottom:"0px"}}>
            <section class="container-ab"style={{paddingBottom:"50px"}}>
                <section class="row">
                    <section class="col-lg-12" style={{marginTop:"30px"}}>
                        <section class="section-title">
                            <span className='span-ab'>Our Owner</span>
                            <h2 className='h2-cl'>Meet Our Owner</h2>
                        </section>
                    </section>
                </section>
                <section class="row">
                <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "233px", height: "200px", marginTop:"30px"}} 
                            src="https://media.licdn.com/dms/image/v2/D5603AQHG6aSpJR8VHw/profile-displayphoto-shrink_800_800/B56ZZgWOUVHgAg-/0/1745373161430?e=1750896000&v=beta&t=_pREs7uVemKFqgjy7S1f7JFJQcLN2zSDJEji1rOl9D4" 
                            alt="Alpha Eapen Mammen" 
                        />
                        <h4 className='h4-ab'>Alpha Eapen Mammen</h4>
                        <a href={`http://www.linkedin.com/in/alpha-eapen-mammen-b139b4267/`} target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
                          My Profile
                        </a>
                    </section>
                  </section>
                  
                    </section>
                  </section>
                </section>
        {/* Team Section End  */}
          <section className={`mt-3 ${darkMode ? 'text-light' : ''}`} >
          <h2 className='h2-cl' style={{fontWeight:"bold"}}>Tech Stack</h2>
            <section className="card" style={{ background: darkMode ? '#343a40' : '',margin:"50px 300px 50px 300px",width:"560px",height:"220px",padding:"30px 60px"}} >
              <section className="card-body" >
                <p className={`card-text ${darkMode ? 'text-light' : 'text-dark'}`}>
                  <strong>Frontend: </strong>&nbsp;&nbsp;&nbsp; HTML,CSS, Bootstrap, JavaScript, React.js &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Socket.io Client <br />
                  <br/> <strong>Backend :</strong>&nbsp;&nbsp;&nbsp;&nbsp; Node.js, Express.js ,Socket.io<br />
                  <br/> <strong>Database:</strong>&nbsp;&nbsp;&nbsp;&nbsp; MongoDB
                </p>
              </section>
            </section>
          </section>
        </div>
      </div>
     </div>
    </div>
  );
};

export default AboutUs;
