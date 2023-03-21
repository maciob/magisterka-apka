import React, { useState, useEffect } from 'react';
import '../css/login.css'
import Switch from "react-switch";

function GeneratorSettings() {
  const [length, setLength] = useState('');
  const [lower, setLower] = useState(false);
  const [upper, setUpper] = useState(false);
  const [special, setSpecial] = useState(false);
  const [numbers, setNumbers] = useState(false);

  useEffect(() => {
    setLength(sessionStorage.getItem('SettingsLength'))
    setLower(sessionStorage.getItem('SettingsLower') === 'true');
    setUpper(sessionStorage.getItem('SettingsUpper') === 'true');
    setSpecial(sessionStorage.getItem('SettingsSpecial') === 'true');
    setNumbers(sessionStorage.getItem('SettingsNumbers') === 'true');
  }, []);



  const handleSubmitClick = async (e) => {
    e.preventDefault();

    sessionStorage.setItem('SettingsLength', length);
    sessionStorage.setItem('SettingsLower', lower);
    sessionStorage.setItem('SettingsUpper', upper);
    sessionStorage.setItem('SettingsSpecial', special);
    sessionStorage.setItem('SettingsNumbers', numbers);
  };

  return (
    <div>
      <div className="form">
        <form onSubmit={handleSubmitClick}>
            <div className="form__input-group">
                <label htmlFor="length" className="form__label">Length</label>
                <input
                    type="text"
                    id="length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="form__input"
                />
            </div>
            <div className="form__input-group">
                <label htmlFor="lower" className="form__label">Lower characters</label>
                <div className="form__toggle">
                    <label>
                        <Switch 
                            onChange={(checked) => setLower(checked)} 
                            checked={lower}
                            className="react-switch"
                        />
                    </label>
                </div>
            </div>
            <div className="form__input-group">
                <label htmlFor="upper" className="form__label">Upper characters</label>
                <div className="form__toggle">
                    <label>
                        <Switch 
                            onChange={(checked) => setUpper(checked)} 
                            checked={upper}
                            className="react-switch"
                        />
                    </label>
                </div>
            </div>
            <div className="form__input-group">
                <label htmlFor="special" className="form__label">Special characters</label>
                <div className="form__toggle">
                    <label>
                        <Switch 
                            onChange={(checked) => setSpecial(checked)} 
                            checked={special}
                            className="react-switch"
                        />
                    </label>
                </div>
            </div>
            <div className="form__input-group">
                <label htmlFor="numbers" className="form__label">Numbers</label>
                <div className="form__toggle">
                    <label>
                        <Switch 
                            onChange={(checked) => setNumbers(checked)} 
                            checked={numbers}
                            className="react-switch"
                        />
                    </label>
                </div>
            </div>
            <button type="submit" className="form__button">Save</button>
        </form>
      </div>
    </div>
  );
}

export default GeneratorSettings;
