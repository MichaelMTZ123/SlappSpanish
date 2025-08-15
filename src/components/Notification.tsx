/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const Notification = ({ message }) => {
    if (!message) return null;

    return (
        <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-xl shadow-2xl max-w-sm z-50 animate-fade-in-down">
            <p>{message}</p>
        </div>
    );
};
