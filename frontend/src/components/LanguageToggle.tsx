import React from 'react';
import { useLanguage } from '../context/LanguageContext';

// const classes = (value: string) =>
//   value
//     .split(/\s+/)
//     .filter(Boolean)
//     .map((name) => (styles as Record<string, string>)[name] ?? name)
//     .join(' ');

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button id="languageToggle" onClick={toggleLanguage} style={{ cursor: 'pointer' }}>
      {language === 'EN' ? 'VI' : 'EN'}
    </button>
  );
};

export default LanguageToggle;
