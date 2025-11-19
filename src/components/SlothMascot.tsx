
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
    const uniqueId = useId().replace(/:/g, ''); 
    const faceGradientId = `faceGradient-${uniqueId}`;
    const dropShadowId = `dropShadow-${uniqueId}`;
    const leatherGradientId = `leatherGradient-${uniqueId}`;
    const hatGradientId = `hatGradient-${uniqueId}`;
    const maskGradientId = `maskGradient-${uniqueId}`;

    return (
        <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id={faceGradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#F5EFE6" />
                    <stop offset="100%" stopColor="#E8DCCA" />
                </radialGradient>
                
                {/* Leather Gradient for Cowboy Hat */}
                <linearGradient id={leatherGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B4513" />
                    <stop offset="40%" stopColor="#A0522D" />
                    <stop offset="100%" stopColor="#5D4037" />
                </linearGradient>

                 {/* Magician Hat Gradient */}
                 <linearGradient id={hatGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#333" />
                    <stop offset="50%" stopColor="#555" />
                    <stop offset="100%" stopColor="#222" />
                </linearGradient>

                {/* Mask Gradient for 3D effect */}
                <radialGradient id={maskGradientId} cx="30%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#DDDDDD" />
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
            
            {/* Glasses - Scaled up slightly */}
            {outfit === 'glasses' && (
                <g filter={`url(#${dropShadowId})`} transform="scale(1.15)" transform-origin="100 110">
                    <path d="M45,110 Q45,95 65,95 T85,110 Q85,125 65,125 T45,110 Z" fill="#222" fillOpacity="0.8" stroke="#000" strokeWidth="2"/>
                    <path d="M115,110 Q115,95 135,95 T155,110 Q155,125 135,125 T115,110 Z" fill="#222" fillOpacity="0.8" stroke="#000" strokeWidth="2"/>
                    <line x1="85" y1="110" x2="115" y2="110" stroke="#000" strokeWidth="3" />
                    <line x1="45" y1="110" x2="30" y2="105" stroke="#000" strokeWidth="3" />
                    <line x1="155" y1="110" x2="170" y2="105" stroke="#000" strokeWidth="3" />
                </g>
            )}

            {/* Cowboy Hat - Improved Texture & Size */}
            {outfit === 'hat_cowboy' && (
                <g transform="translate(0, -20) scale(1.1)" transform-origin="100 55" filter={`url(#${dropShadowId})`}>
                    {/* Back Brim */}
                    <path d="M20,55 Q100,85 180,55" fill="none" stroke={`url(#${leatherGradientId})`} strokeWidth="0" />
                    
                    {/* Main Brim with Leather Texture */}
                    <ellipse cx="100" cy="55" rx="80" ry="20" fill={`url(#${leatherGradientId})`} />
                    {/* Stitching Details on Brim */}
                    <ellipse cx="100" cy="55" rx="75" ry="16" fill="none" stroke="#D2B48C" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.8" />
                    
                    {/* Hat Crown Top */}
                    <path d="M55,55 L60,15 Q100,5 140,15 L145,55 Z" fill={`url(#${leatherGradientId})`} />
                    
                    {/* Hat Band */}
                    <path d="M55,50 Q100,60 145,50 L145,42 Q100,52 55,42 Z" fill="#3E2723" />
                    {/* Buckle on Band */}
                    <rect x="120" y="44" width="10" height="8" rx="1" fill="#FFD700" />
                    
                    {/* Crown Indent shading */}
                    <path d="M100,10 Q80,20 100,35 Q120,20 100,10" fill="#000" fillOpacity="0.1" />
                </g>
            )}

            {/* Crown - Scaled up */}
            {outfit === 'crown' && (
                 <g transform="translate(0, -30) scale(1.2)" transform-origin="100 50" filter={`url(#${dropShadowId})`}>
                     <path d="M60,60 L70,20 L100,50 L130,20 L140,60 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2" strokeLinejoin="round"/>
                     <circle cx="70" cy="20" r="4" fill="#FF4500" />
                     <circle cx="130" cy="20" r="4" fill="#FF4500" />
                     <circle cx="100" cy="50" r="3" fill="#00BFFF" />
                     <circle cx="100" cy="25" r="5" fill="#FF4500" />
                     {/* Base Gem */}
                     <rect x="95" y="55" width="10" height="5" fill="#00BFFF" />
                 </g>
            )}

            {/* Magician (Top Hat & Wand) - Improved */}
            {outfit === 'magician' && (
                <g filter={`url(#${dropShadowId})`} transform="translate(0, -25) scale(1.2)" transform-origin="100 50">
                    {/* Hat Brim */}
                    <ellipse cx="100" cy="55" rx="45" ry="8" fill={`url(#${hatGradientId})`} stroke="#000" strokeWidth="1"/>
                    {/* Hat Body */}
                    <path d="M70,55 L70,15 Q100,10 130,15 L130,55 Z" fill={`url(#${hatGradientId})`} stroke="#000" strokeWidth="1"/>
                     {/* Hat Band */}
                    <path d="M70,50 Q100,55 130,50 L130,45 Q100,50 70,45 Z" fill="#D32F2F" />
                    {/* Hat Shine */}
                    <path d="M120,20 Q125,30 120,40" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.3" />

                    {/* Wand - Positioned down and bigger */}
                    <g transform="translate(135, 130) rotate(-20) scale(1.5)">
                         <rect x="0" y="0" width="50" height="7" fill="#333" rx="2" stroke="#000" strokeWidth="0.5"/>
                         <rect x="0" y="0" width="10" height="7" fill="#FFF" rx="2" stroke="#000" strokeWidth="0.5"/>
                         <rect x="40" y="0" width="10" height="7" fill="#FFF" rx="2" stroke="#000" strokeWidth="0.5"/>
                    </g>
                    
                    {/* Stars */}
                    <text x="150" y="50" fontSize="20" fill="gold">✨</text>
                    <text x="155" y="120" fontSize="20" fill="gold">✨</text>
                </g>
            )}

            {/* Mask (White Smile) - Improved */}
            {outfit === 'mask' && (
                 <g filter={`url(#${dropShadowId})`} transform="scale(1.1)" transform-origin="100 100">
                     {/* Mask Face with Gradient for 3D effect */}
                     <path d="M55,60 C45,80 45,150 100,165 C155,150 155,80 145,60 C125,40 75,40 55,60 Z" fill={`url(#${maskGradientId})`} stroke="#CCCCCC" strokeWidth="1" />
                     
                     {/* Squinting Eyes - Separated */}
                     <path d="M65,90 Q80,80 95,90" fill="none" stroke="#222" strokeWidth="5" strokeLinecap="round" />
                     <path d="M105,90 Q120,80 135,90" fill="none" stroke="#222" strokeWidth="5" strokeLinecap="round" />
                     
                     {/* Wide Smile */}
                     <path d="M75,120 Q100,150 125,120" fill="none" stroke="#222" strokeWidth="5" strokeLinecap="round" />
                     
                     {/* Cheek shading */}
                     <ellipse cx="65" cy="110" rx="5" ry="3" fill="#000" opacity="0.1" />
                     <ellipse cx="135" cy="110" rx="5" ry="3" fill="#000" opacity="0.1" />

                     {/* Strap */}
                     <path d="M55,85 L40,80" stroke="#333" strokeWidth="3" opacity="0.6" />
                     <path d="M145,85 L160,80" stroke="#333" strokeWidth="3" opacity="0.6" />
                 </g>
            )}
        </svg>
    );
};
