/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const RankLogo = ({ rank, className = '' }) => {
    const logos = {
        novato: () => (
            // A simple sloth face in a leaf
            <g>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#a0846d"/>
                <path d="M14.5 14.5c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5c0-.9.47-1.7 1.2-2.15-.35-.59-.55-1.29-.55-2.05 0-2.21 1.79-4 4-4s4 1.79 4 4c0 .76-.2 1.46-.55 2.05.73.45 1.2 1.25 1.2 2.15" fill="#f5efe6" transform="translate(-1, -1) scale(0.9)"/>
                <circle cx="10" cy="10.5" r="1" fill="#2c2c2c"/>
                <circle cx="14" cy="10.5" r="1" fill="#2c2c2c"/>
            </g>
        ),
        aprendiz: () => (
            // Sloth hanging from a branch
            <g>
                <path d="M2.5,9 C2.5,9 7,4.5 12,4.5 C17,4.5 21.5,9 21.5,9" fill="none" stroke="#8B5E3C" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12,22 C16.4183,22 20,18.4183 20,14 C20,9.58172 16.4183,6 12,6 C7.58172,6 4,9.58172 4,14 C4,18.4183 7.58172,22 12,22 Z" fill="#C2A993"/>
                <path d="M12,20 C15.3137,20 18,17.3137 18,14 C18,10.6863 15.3137,8 12,8 C8.68629,8 6,10.6863 6,14 C6,17.3137 8.68629,20 12,20 Z" fill="#A0846D"/>
                <path d="M14.2,16c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-0.6,0.3-1.2,0.7-1.5 C9.8,13.6,9,12.4,9,11c0-1.65,1.35-3,3-3s3,1.35,3,3c0,1.4-0.8,2.6-1.9,3.1 C13.9,14.8,14.2,15.4,14.2,16z" fill="#F5EFE6"/>
                <circle fill="#2C2C2C" cx="10.5" cy="11" r="0.8"/>
                <circle fill="#2C2C2C" cx="13.5" cy="11" r="0.8"/>
            </g>
        ),
        maestro: () => (
            // Sloth with a graduation cap
            <g>
                <path d="M12,22 C17.5228,22 22,17.5228 22,12 C22,6.47715 17.5228,2 12,2 C6.47715,2 2,6.47715 2,12 C2,17.5228 6.47715,22 12,22 Z" fill="#a0846d"/>
                <path d="M15.4,15.2c0,1.4-1.1,2.5-2.5,2.5s-2.5-1.1-2.5-2.5c0-0.77,0.3-1.46,0.9-1.9 C10.1,12.2,9,10.6,9,8.7c0-1.93,1.6-3.5,3.5-3.5s3.5,1.57,3.5,3.5c0,1.9-1.1,3.5-2.4,4.4 C15.1,13.74,15.4,14.43,15.4,15.2z" fill="#f5efe6" transform="translate(0, 1)"/>
                <circle cx="11" cy="8.7" r="1.2" fill="#2c2c2c"/>
                <circle cx="15" cy="8.7" r="1.2" fill="#2c2c2c"/>
                <path d="M4 8l8 4 8-4" stroke="#2c2c2c" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12v3" stroke="#2c2c2c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M2,7 L12,2 L22,7 L12,12 L2,7 Z" fill="#2c2c2c" />
                <path d="M18.5,7.5 L18.5,9" stroke="#EAC117" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
        ),
        leyenda: () => (
            // A sloth with a crown and a shield/crest
            <g>
                <path d="M5 22h14c1.1 0 2-1.34 2-3V5c0-1.1-.9-2-2-2H5C3.9 3 3 4.1 3 5v14c0 1.66 1.1 3 2 3z" fill="#C2A993"/>
                <path d="M12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#A0846D"/>
                <path d="M14.5,14c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-0.61,0.27-1.16,0.7-1.52 C10.27,11.63,9.5,10.4,9.5,9c0-1.65,1.35-3,3-3s3,1.35,3,3c0,1.4-0.77,2.63-1.89,3.15 C14.23,12.84,14.5,13.39,14.5,14z" fill="#F5EFE6"/>
                <path d="M9 3.5L11 6L13 3.5L15 6L17 3.5" stroke="#FFD700" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="2.5" r="1" fill="#FFD700"/>
                <circle cx="13" cy="2.5" r="1" fill="#FFD700"/>
                <circle cx="17" cy="2.5" r="1" fill="#FFD700"/>
            </g>
        )
    };
    const LogoComponent = logos[rank] || logos.novato;
    return <svg viewBox="0 0 24 24" fill="none" className={className}><LogoComponent /></svg>;
};