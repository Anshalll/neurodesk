import React from 'react';

const DisplayContext = ({  isOpenContext }) => {
    return isOpenContext ?   (
        <div className='flex flex-col'>
                <p>Text</p>
                <div>Code</div>
        </div>
    ) : <></>;
}

export default DisplayContext;
