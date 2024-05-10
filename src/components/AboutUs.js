import React from 'react';
import "./AboutUS.css";
import { padding } from '@mui/system';

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
                            src="https://media.licdn.com/dms/image/D5603AQGuMKQmywjDCQ/profile-displayphoto-shrink_800_800/0/1711382864122?e=1720656000&v=beta&t=xt4rFoVtHKyCaI5TKvLfHr84OerbD1zr07Zez0f89yM" 
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
                            src="https://media.licdn.com/dms/image/D5603AQFaQ4LD7OgxxQ/profile-displayphoto-shrink_800_800/0/1715161151175?e=1720656000&v=beta&t=R_Qc0oXf8FPDWFDk-uZzEpdMIZOKr7M77V10VuQ1cCA" 
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
                            src="https://media.licdn.com/dms/image/D5603AQH87fLTla68SA/profile-displayphoto-shrink_800_800/0/1710759633365?e=1720656000&v=beta&t=BT4VHIO5WUc2I_LyXbNF3_fRgM0kaThjd-1c0SzedAc" 
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
                            src="https://media.licdn.com/dms/image/C5603AQEUC0o3D0actw/profile-displayphoto-shrink_800_800/0/1658586743446?e=1720656000&v=beta&t=IbAXsilLO92DpEkGSlwCL4QSpaiv380T58UKxbkHxdo" 
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
                  <strong>Frontend: </strong>&nbsp;&nbsp;&nbsp; HTML,CSS, Bootstrap, JavaScript, React.js <br />
                  <br/> <strong>Backend :</strong>&nbsp;&nbsp;&nbsp;&nbsp; Node.js, Express.js <br />
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
