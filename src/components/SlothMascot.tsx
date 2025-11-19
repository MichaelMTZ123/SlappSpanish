
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useId } from 'react';

interface SlothMascotProps {
    className?: string;
    outfit?: string; // 'glasses', 'hat_cowboy', 'crown', 'magician', 'mask'
}

export const SlothMascot: React.FC<SlothMascotProps> = ({ className = '', outfit }) => {
    // Generate a unique ID for this instance to prevent ID collisions in the DOM
    // which causes the "missing face" bug on mobile (browser tries to use a hidden gradient ID).
    const uniqueId = useId().replace(/:/g, ''); 
    const faceGradientId = `faceGradient-${uniqueId}`;
    const dropShadowId = `dropShadow-${uniqueId}`;

    return (
        <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id={faceGradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#F5EFE6" />
                    <stop offset="100%" stopColor="#E8DCCA" />
                </radialGradient>
                <filter id={dropShadowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="1" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge> 
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                </filter>
            </defs>

            {/* Body/Head Shape */}
            <path fill="#A0846D" d="M100,15 C50,15 20,55 20,100 C20,150 45,190 100,190 C155,190 180,150 180,100 C180,55 150,15 100,15 Z" />
            
            {/* Face Patch - referencing unique ID */}
            <path fill={`url(#${faceGradientId})`} d="M100,40 C140,40 160,70 160,110 C160,155 135,175 100,175 C65,175 40,155 40,110 C40,70 60,40 100,40 Z" />

            {/* Eye Patches */}
            <path fill="#8B6B52" d="M70,90 C55,90 45,100 45,115 C45,135 60,140 75,130 C85,122 85,100 70,90 Z" />
            <path fill="#8B6B52" d="M130,90 C145,90 155,100 155,115 C155,135 140,140 125,130 C115,122 115,100 130,90 Z" />

            {/* Eyes (Shiny) */}
            <circle fill="#2C2C2C" cx="65" cy="110" r="8" />
            <circle fill="#FFFFFF" cx="68" cy="108" r="3" />
            
            <circle fill="#2C2C2C" cx="135" cy="110" r="8" />
            <circle fill="#FFFFFF" cx="138" cy="108" r="3" />

            {/* Nose */}
            <ellipse fill="#2C2C2C" cx="100" cy="135" rx="12" ry="8" />
            <path fill="#FFFFFF" fillOpacity="0.3" d="M96,133 Q100,130 104,133" stroke="none" />

            {/* Smile */}
            <path d="M85,150 Q100,160 115,150" fill="none" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" />

            {/* Hair/Fur Tuft */}
            <path fill="none" stroke="#A0846D" strokeWidth="4" strokeLinecap="round" d="M90,15 Q100,5 110,15" />
            
            {/* Cute Cheek Blush */}
            <circle fill="#FFB7B2" fillOpacity="0.6" cx="55" cy="135" r="8" />
            <circle fill="#FFB7B2" fillOpacity="0.6" cx="145" cy="135" r="8" />

            {/* --- OUTFITS --- */}
            
            {/* Glasses */}
            {outfit === 'glasses' && (
                <g filter={`url(#${dropShadowId})`}>
                    <path d="M45,110 Q45,95 65,95 T85,110 Q85,125 65,125 T45,110 Z" fill="#222" fillOpacity="0.8" stroke="#000" strokeWidth="2"/>
                    <path d="M115,110 Q115,95 135,95 T155,110 Q155,125 135,125 T115,110 Z" fill="#222" fillOpacity="0.8" stroke="#000" strokeWidth="2"/>
                    <line x1="85" y1="110" x2="115" y2="110" stroke="#000" strokeWidth="3" />
                    <line x1="45" y1="110" x2="30" y2="105" stroke="#000" strokeWidth="3" />
                    <line x1="155" y1="110" x2="170" y2="105" stroke="#000" strokeWidth="3" />
                </g>
            )}

            {/* Cowboy Hat */}
            {outfit === 'hat_cowboy' && (
                <g transform="translate(0, -15)" filter={`url(#${dropShadowId})`}>
                    <ellipse cx="100" cy="55" rx="75" ry="20" fill="#654321" />
                    <path d="M60,55 L65,25 Q100,15 135,25 L140,55 Z" fill="#543210" />
                    <path d="M65,25 Q100,15 135,25" fill="none" stroke="#3e270c" strokeWidth="2" />
                    <path d="M60,50 Q100,60 140,50" fill="none" stroke="#8B4513" strokeWidth="5" />
                </g>
            )}

            {/* Crown */}
            {outfit === 'crown' && (
                 <g transform="translate(0, -25)" filter={`url(#${dropShadowId})`}>
                     <path d="M60,60 L70,20 L100,50 L130,20 L140,60 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2" strokeLinejoin="round"/>
                     <circle cx="70" cy="20" r="4" fill="#FF4500" />
                     <circle cx="130" cy="20" r="4" fill="#FF4500" />
                     <circle cx="100" cy="50" r="3" fill="#00BFFF" />
                     <circle cx="100" cy="25" r="5" fill="#FF4500" />
                 </g>
            )}

            {/* Magician (Top Hat & Wand) */}
            {outfit === 'magician' && (
                <g filter={`url(#${dropShadowId})`}>
                    {/* Hat */}
                    <rect x="55" y="50" width="90" height="10" rx="2" fill="#222" stroke="#000" />
                    <rect x="70" y="15" width="60" height="35" fill="#222" stroke="#000" />
                    <rect x="70" y="40" width="60" height="5" fill="#D32F2F" />
                    {/* Wand */}
                    <path d="M160,140 L180,120" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
                    <path d="M178,122 L182,118" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
                    {/* Stars */}
                    <path d="M175,110 L176,112 L178,112 L176,114 L177,116 L175,114 L173,116 L174,114 L172,112 L174,112 Z" fill="yellow" />
                </g>
            )}

            {/* Mask (White Smile) */}
            {outfit === 'mask' && (
                 <g filter={`url(#${dropShadowId})`}>
                     {/* Mask Face */}
                     <path d="M60,60 C50,80 50,150 100,165 C150,150 150,80 140,60 C120,40 80,40 60,60 Z" fill="#FFFFFF" stroke="#DDDDDD" strokeWidth="1" />
                     {/* Squinting Eyes */}
                     <path d="M70,95 Q80,85 90,95" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" />
                     <path d="M110,95 Q120,85 130,95" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" />
                     {/* Wide Smile */}
                     <path d="M75,125 Q100,155 125,125" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" />
                     {/* Strap */}
                     <path d="M55,100 L45,95" stroke="#333" strokeWidth="2" opacity="0.5" />
                     <path d="M145,100 L155,95" stroke="#333" strokeWidth="2" opacity="0.5" />
                 </g>
            )}
        </svg>
    );
};
