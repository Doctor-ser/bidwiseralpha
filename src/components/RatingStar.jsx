import React from 'react';

function RatingStar({ rating, onChange }) {
  return (
    <div style={{margin:"0px"}}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className='star'
          style={{
            cursor: 'pointer',
            color: rating >= star ? 'gold' : 'gray',
            fontSize: '35px',
          }}
          onClick={() => {
            onChange({ target: { name: 'rating', value: star } });
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default RatingStar;
