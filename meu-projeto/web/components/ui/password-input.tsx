'use client'

import { useState, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordInput({
    id = 'password',
    name = 'password',
    placeholder = '••••••••',
    autoComplete = 'current-password',
    required = true,
}: {
    id?: string
    name?: string
    placeholder?: string
    autoComplete?: string
    required?: boolean
}) {
    const [visible, setVisible] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const toggle = () => {
        setVisible((v) => !v)
        // Preserve cursor position after type change
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    return (
        <div className="relative">
            <input
                ref={inputRef}
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                className="input-premium"
                style={{
                    padding: '12px 44px 12px 16px',
                    borderRadius: 10,
                    fontSize: 14,
                    width: '100%',
                    boxSizing: 'border-box',
                }}
            />
            <button
                type="button"
                onClick={toggle}
                aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: 'rgba(255,255,255,0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)' }}
            >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    )
}
