import React from 'react';
import { Language, LanguageOption } from '../types';

interface LanguageSelectorProps {
  selected: Language;
  onChange: (lang: Language) => void;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
];

export default class LanguageSelector extends React.Component<LanguageSelectorProps> {
  handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onChange(event.target.value as Language);
  };

  render() {
    return (
      <div className="language-selector">
        <label htmlFor="language" className="text-primary text-sm">
          Language:
        </label>
        <select
          id="language"
          value={this.props.selected}
          onChange={this.handleChange}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
