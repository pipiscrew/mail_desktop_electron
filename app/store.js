const fs = require('fs');
const path = require('path');

  function save(key, value) {
    this.settings = loadSettings();
    this.settings[key] = value;
    fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(this.settings, null, 2));
    // console.log(`Saved ${key}: ${value} to settings.json`);
  }

  function load(key) {
     this.settings = loadSettings();
     return this.settings[key];
  }

  function getValueOrDefault(key, defaultValue) {
    let value = load(key);
    if (value === undefined) {
      save(key, defaultValue);
      return defaultValue;
    }
    return value;
  }

  function loadSettings() {
    try {
      let data = fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If the file doesn't exist or there's an error parsing it, return an empty object
      console.log(`Error loading settings: ${error.message}`);
      return {};
    }
  }

module.exports = { save, load, getValueOrDefault };
