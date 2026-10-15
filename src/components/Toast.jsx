import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1F1A17',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        zIndex: 60,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <CheckCircle size={16} color="#2F9E44" />
      <span>{message}</span>
    </div>
  );
}
