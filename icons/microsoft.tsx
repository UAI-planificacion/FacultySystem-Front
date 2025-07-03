import { SVGProps } from 'react';

export function MicrosoftIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg 
            width="20px" 
            height="20px" 
            viewBox="0 0 16 16" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none"
            className={className}
            {...props}
        >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path fill="#F35325" d="M1 1h6.5v6.5H1V1z"></path>
                <path fill="#81BC06" d="M8.5 1H15v6.5H8.5V1z"></path>
                <path fill="#05A6F0" d="M1 8.5h6.5V15H1V8.5z"></path>
                <path fill="#FFBA08" d="M8.5 8.5H15V15H8.5V8.5z"></path>
            </g>
        </svg>
    );
}