import React, { useEffect, useState } from 'react';

type TripleSwitchProps = {
  defaultValue: 'approved' | 'notapproved' | 'denied' | 'notUploaded';
  onChange: (newStatus: 'approved' | 'notapproved' | 'denied' | 'notUploaded') => void;
  confirm: (newStatus: 'approved' | 'notapproved' | 'denied' | 'notUploaded', callback: (confirmed: boolean) => void) => void;
  disabled?: boolean;
};

const TripleSwitch: React.FC<TripleSwitchProps> = ({ defaultValue, onChange, confirm, disabled }) => {
  const [value, setValue] = useState<'approved' | 'notapproved' | 'denied' | 'notUploaded'>(defaultValue);
  const [pendingValue, setPendingValue] = useState<'approved' | 'notapproved' | 'denied' | 'notUploaded' | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (newValue: 'approved' | 'notapproved' | 'denied' | 'notUploaded') => {
    if (!disabled && newValue !== value) {
      setPendingValue(newValue);
      confirm(newValue, (confirmed) => {
        if (confirmed && pendingValue !== null) {
          setValue(pendingValue);
          onChange(pendingValue);
        }

        setPendingValue(null);
      });
    }
  };

  return (
    <div className="inline-flex items-center rounded-full p-1 w-32 h-6 bg-gray-200 relative">
      <button
        className={`flex items-center justify-center w-10 h-4 rounded-full transition-all ${value === 'approved' ? 'bg-green-600 text-white' : 'bg-transparent text-green-600'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => handleChange('approved')}
        disabled={disabled || value === 'approved'}
      >
        <i className='tabler-check' />
      </button>
      <button
        className={`flex items-center justify-center w-10 h-4 rounded-full transition-all ${value === 'notapproved' ? 'bg-blue-600 text-white' : 'bg-transparent text-blue-600'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        disabled // Placeholder button for 'notapproved' state
      >
        {/* You might add an icon or text for 'notapproved' here */}
      </button>
      <button
        className={`flex items-center justify-center w-10 h-4 rounded-full transition-all ${value === 'denied' ? 'bg-red-600 text-white' : 'bg-transparent text-red-600'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => handleChange('denied')}
        disabled={disabled || value === 'denied'}
      >
        <i className='tabler-x' />
      </button>
    </div>
  );
};

export default TripleSwitch;
