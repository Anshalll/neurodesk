import React, { useState } from 'react';

const DisplayContext = ({ isOpenContext ,  xpos , ypos }) => {

    const TransFormOptions = [
        {
            "type": "text", 
            "attribute": "h1" , 
            "name" : "Header 1",
            "size": ""
            
        },
        {
            "type": "text",
            "attribute": "h2",
            "name": "Header 2",
            "size": ""

        },
        {
            "type": "text",
            "attribute": "h3",
            "name": "Header 3",
            "size": ""

        },
        {
            "type": "text",
            "attribute": "h4",
            "name": "Header 4",
            "size": ""

        }
    ]

    const [ShowTransform , setShowTransform] = useState(false)
    return isOpenContext ? (
        <div
            className="fixed border border-gray-500 w-[200px] rounded-lg z-50 flex flex-col"
            style={{ left: `${xpos}px`, top: `${ypos}px` }}
        >
                <div className='p-[10px]'>
                    <div>
                            wdwwwwww<h1>Transform</h1>

                    </div>
                <div className=' flex flex-col gap-[2px] px-[20px]'>

                    { 
                        TransFormOptions.map((value, index) => ( 
                            <div key={index}>
                                <p>{value.name}</p>
                            </div>
                        ))
                    }

                </div>

                </div>
                <div>Code</div>
        </div>
    ) : null;
}

export default DisplayContext;
