
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const RankLogo = ({ rank, className = '' }) => {
    const logos = {
        novato: () => (
            // Novato: A sprouting seed
            <g>
                <circle cx="12" cy="12" r="10" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2"/>
                <path d="M12 18V12" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12C12 12 16 10 16 6C16 4 12 6 12 12Z" fill="#66BB6A"/>
                <path d="M12 12C12 12 8 10 8 7C8 5 12 7 12 12Z" fill="#81C784"/>
            </g>
        ),
        aprendiz: () => (
            // Aprendiz: A sturdy sapling/small tree
            <g>
                <circle cx="12" cy="12" r="10" fill="#E3F2FD" stroke="#2196F3" strokeWidth="2"/>
                <path d="M12 19V10" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 10L15 7" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12L9 9" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="5" r="3" fill="#4CAF50"/>
                <circle cx="16" cy="8" r="2.5" fill="#66BB6A"/>
                <circle cx="8" cy="8" r="2.5" fill="#66BB6A"/>
            </g>
        ),
        maestro: () => (
            // Maestro: A large tree with fruit
            <g>
                <circle cx="12" cy="12" r="10" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2"/>
                <path d="M12 19V13" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 13C16 13 19 10 19 7C19 4 15 4 12 7C9 4 5 4 5 7C5 10 8 13 12 13Z" fill="#43A047"/>
                <circle cx="10" cy="7" r="1.5" fill="#F44336"/>
                <circle cx="14" cy="9" r="1.5" fill="#F44336"/>
                <circle cx="14" cy="5" r="1.5" fill="#F44336"/>
            </g>
        ),
        leyenda: () => (
            // Leyenda: A golden crown with a gem
            <g>
                <circle cx="12" cy="12" r="10" fill="#FFF8E1" stroke="#FFD700" strokeWidth="2"/>
                <path d="M6 16H18" stroke="#FFC107" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 16L4 8L9 11L12 5L15 11L20 8L18 16" fill="#FFD700" stroke="#FFA000" strokeWidth="1" strokeLinejoin="round"/>
                <path d="M12 13L12 13" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/> 
            </g>
        )
    };
    const LogoComponent = logos[rank] || logos.novato;
    return <svg viewBox="0 0 24 24" fill="none" className={className}><LogoComponent /></svg>;
};