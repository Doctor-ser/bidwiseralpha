import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Product.css';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate,Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {Buffer} from 'buffer'

export function ActiveBid({product,sendEmailToWinner,handleBid,calculateRemainingTime}){
  const [imageStream,setImageStream] =useState(null)

  useEffect(()=>{
    (async ()=>{const imageResponse =  await fetch(`http://127.0.0.1:5500/api/images/${product.imageUrl}`);
        // console.log(imageResponse)
        const data = await imageResponse.json()
        // const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer.buffer)));
        const base64String = Buffer.from(data.buffer.data).toString('base64')
        const image = `data:${data.contentType};base64,${base64String}`;     
        setImageStream(image)})()
       
  })
    
  return (<div className="col-md-4 mb-4 ">
                
                  <div className='container-fluid'>
                      <div className="card mx-auto col-md-3 col-10 mt-5 ">
                      <div className='imagecontainer'>
                      <img
                     src={imageStream}
                      alt={product.name}
                      className="mx-auto img-thumbnail"/>
                      </div>
                            <div className="card-body win text-center mx-auto">
                                <div className='cvp'>
                                    <h5 className="card-title font-weight-bold">{product.name}</h5>
                                    <p className="card-text">Current Bid: &#8377;{product.currentBid}</p>
                                    <p className="card-text">{product.endTime &&
                                        (() => {
                                            const remainingTime = calculateRemainingTime(product.endTime);
                                            if (remainingTime.ended) {
                                              // const winnerUserId = winningUsers[product._id];
                                              const winningBid = product.currentBid;

                                              if (!localStorage.getItem(`${product._id}_email_sent`)) { // Check if email has not been sent
                                                    sendEmailToWinner(product.name, winningBid, product._id);
                                                    localStorage.setItem(`${product._id}_email_sent`, 'true'); // Set flag in local storage
                                              }
                                        
                                              return `Bid has ended`;

                                            } else {
                                              return `${remainingTime.message}`;
                                            }
                                        })()
                                      }
                                  </p>
                                  <Link to={`/products/${product._id}`} className="btn btn-view m">View Details</Link>
                                  <button className="btn-p cart px-auto" onClick={() => handleBid(product._id, product.currentBid, product.startingBid,product.category)}>
                                      Place Bid
                                  </button>
                                </div>
                            </div>
                      </div>
                  </div>
                  

            </div>)
}
