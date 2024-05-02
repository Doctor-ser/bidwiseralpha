import React from 'react'

function RatingReview({ rating, setRating }) {
  return (
    <div className='star'>
      {[1, 2, 3, 4, 5].map((star) => {
        return (  
          <span
            className='start'
            style={{
              color: rating >= star ? 'gold' : 'gray',
              fontSize: `40px`,
            }}
          >
            {' '}
            ★{' '}
          </span>
        )
      })}
    </div>
  )
}

export default RatingReview;