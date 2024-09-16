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
                            <span className='span-ab'>Our Team</span>
                            <h2 className='h2-cl'>Meet Our Team</h2>
                        </section>
                    </section>
                </section>
                <section class="row">
                <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "273px", height: "300px", marginTop:"30px"}} 
                            src="https://media.licdn.com/dms/image/v2/D5603AQEUODLCXroe6g/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1724874781935?e=1732147200&v=beta&t=_buNQti6r2SIGR8ID2Fg8uOYRS1MHvGv_Qqk-Xjo5ZY" 
                            alt="Alfin Joji" 
                        />
                        <h4 className='h4-ab'>Alfin Joji</h4>
                        <a href={`https://www.linkedin.com/in/alfin-joji-736068228/`} target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
                          My Profile
                        </a>
                    </section>
                  </section>
                  <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "273px", height: "300px" , marginTop:"30px"}} 
                            src="https://media.licdn.com/dms/image/v2/D5603AQGETxW8qvxMcg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1720236129027?e=1732147200&v=beta&t=zo3Jv9b-LCW8PzUoNWchChF3QVLZCDfwlIWtq9h6zs0" 
                            alt="Ashwin V Mathew" 
                        />
                        <h4 className='h4-ab'>Ashwin V Mathew</h4>
                        <a href={`https://www.linkedin.com/in/ashwin-v-mathew`} target="_blank" rel="noopener noreferrer" style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}}  onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
                          My Profile
                        </a>
                    </section>
                  </section>
                  <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "273px", height: "300px" , marginTop:"30px"}} 
                            src="https://media.licdn.com/dms/image/v2/D4E03AQHLrKaSjGai6w/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1718784736184?e=1732147200&v=beta&t=hfALodGqFQEnb2DQqNv1Quxbd3kwz-jk5WeS-C7P9w8" 
                            alt="Johan George" 
                        />
                        <h4 className='h4-ab'>Johan George Kuruvilla</h4>
                        <a href={`https://www.linkedin.com/in/johan-george-kuruvilla-a4927a227`} target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
                           My Profile
                        </a>                    
                    </section>
                  </section>
                  <section className="col-lg-3 col-md-6 col-sm-6">
                    <section className="team__item"  style={{textAlign:"center"}}>
                        <img className='imgx'
                            style={{ width: "273px", height: "300px" , marginTop:"30px"}} 
                            src="https://media.licdn.com/dms/image/v2/D5635AQH1gz5FryWUEw/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1719451770096?e=1727096400&v=beta&t=o111oFesEdR0Nn1VA11hW6E4b63M4H3Uav4owQiNFtU" 
                            alt="Evan T Abraham" 
                        />
                        <h4 className='h4-ab'>Evan T Abraham</h4>
                        <a href={`https://www.linkedin.com/in/evan-t-abraham-7696a5227`} target="_blank" rel="noopener noreferrer"style={{color:"#b30000",textDecoration:"none",fontWeight:"bold"}} onMouseOver={(e) => e.target.style.color = "#b30000" } onMouseOut={(e) => e.target.style.color = "#e53637"}>
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
