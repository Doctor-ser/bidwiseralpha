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
                            src="https://media.licdn.com/dms/image/v2/D5603AQHxeCw50liFmg/profile-displayphoto-shrink_400_400/B56Zm52HbxHkAg-/0/1759759595929?e=2147483647&v=beta&t=HOqhpXOo75u28p0W0YKKkbzQfLjj4DOubDf9B7A-mWs"
                            alt="Abhishikthu Krishna S"
                        />
                        <h4 className='h4-ab'>Abhishikthu Krishna S</h4>
                        <a href="https://in.linkedin.com/in/abhishikthu-krishna-s-a1ab50388" target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
                          My Profile
                        </a>
                    </section>
                  </section>
                  <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "233px", height: "200px", marginTop:"30px"}}
                            src="https://media.licdn.com/dms/image/v2/D4E03AQFGpHaLlhn04g/profile-displayphoto-scale_400_400/B4EZm55XvgKgAg-/0/1759760450879?e=2147483647&v=beta&t=-Mz1EKCuB-J27oun_D3PVXCdWRxP_DLueYmUW-urtSg"
                            alt="Abhinand Hari"
                        />
                        <h4 className='h4-ab'>Name Placeholder</h4>
                        <a href="https://www.linkedin.com/in/abhinand-hari-1069a9388?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
                          My Profile
                        </a>
                    </section>
                  </section>
                  <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "233px", height: "200px", marginTop:"30px"}}
                            src="https://media.licdn.com/dms/image/v2/D4D03AQEP5PnLkMuFdg/profile-displayphoto-scale_400_400/B4DZm54WABJUB8-/0/1759760180785?e=2147483647&v=beta&t=tXcX58GtxEf5z9WYfjrTcbnza4rhbB23Ec9KUnJePdI"
                            alt="Prestin Prasad"
                        />
                        <h4 className='h4-ab'>Name Placeholder</h4>
                        <a href="https://www.linkedin.com/in/prestin-prasad-3a80b5389?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
                          My Profile
                        </a>
                    </section>
                  </section>
                  <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "233px", height: "200px", marginTop:"30px"}}
                            src="https://media.licdn.com/dms/image/v2/D4D03AQHs9CizxRyyGw/profile-displayphoto-scale_400_400/B4DZm52J1dGwAg-/0/1759759607117?e=2147483647&v=beta&t=NZ8e1sp9KudyDPsMf0XBHRWVCpiogqeLl1636iFlUdg"
                            alt="Shijil P Sabu"
                        />
                        <h4 className='h4-ab'>Name Placeholder</h4>
                        <a href="https://www.linkedin.com/in/shijil-p-sabu-8108a836a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
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
