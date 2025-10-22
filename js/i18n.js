
// Internationalization module
class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('language') || 'en';
    this.translations = {};
    this.loadTranslations();
  }

  loadTranslations() {
    // Load translations from the translations.js file
    this.translations = translations;
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    this.updateUI();
  }

  getTranslation(key) {
    return this.translations[this.currentLang] && this.translations[this.currentLang][key] 
      ? this.translations[this.currentLang][key] 
      : key;
  }

  updateUI() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);

      if (translation) {
        // Handle different element types
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = translation;
        } else if (element.tagName === 'INPUT' && element.type === 'submit') {
          element.value = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.getTranslation(key);
      if (translation) {
        element.placeholder = translation;
      }
    });
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
    return newLang;
  }
}

// Initialize i18n
const i18n = new I18n();
