import React, { useState, useRef, useEffect } from 'react'

/**
 * Custom dropdown so both trigger and options list use our CSS (native <option> cannot be styled).
 * options: array of { value, label } or array of strings (value and label same)
 */
const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  size = 'default',
  className = '',
  id,
  required = false,
  disabled = false
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )
  const selected = normalizedOptions.find(o => o.value === value)
  const displayLabel = selected ? selected.label : placeholder

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = (opt) => {
    onChange({ target: { value: opt.value } })
    setOpen(false)
  }

  return (
    <div className={`custom-select-wrapper ${className} ${size === 'sm' ? 'custom-select-sm' : ''}`} ref={ref}>
      <button
        type="button"
        id={id}
        className={`custom-select-trigger ${open ? 'custom-select-open' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
      >
        <span className={!selected ? 'custom-select-placeholder' : ''}>{displayLabel}</span>
        <span className="custom-select-arrow" aria-hidden>▼</span>
      </button>
      {open && (
        <ul
          className="custom-select-dropdown"
          role="listbox"
          aria-label={placeholder}
        >
          {placeholder && (
            <li
              role="option"
              className="custom-select-option"
              aria-selected={value === ''}
              onClick={() => handleSelect({ value: '', label: placeholder })}
            >
              {placeholder}
            </li>
          )}
          {normalizedOptions.map((opt) => (
            <li
              key={opt.value}
              role="option"
              className={`custom-select-option ${opt.value === value ? 'custom-select-option-selected' : ''}`}
              aria-selected={opt.value === value}
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CustomSelect
