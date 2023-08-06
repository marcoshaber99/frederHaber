import { createContext, useContext, useState } from 'react';

export const LanguageContext = createContext();

export const useLanguage = () => {
    return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // default to English

    const toggleLanguage = () => {
        setLanguage(prevLang => (prevLang === 'en' ? 'el' : 'en'));
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const translations = {
  en: {
    firstName: "First Name",
    lastName: "Last Name",
    governmentId: "Government ID",
    registrationNumber: "Registration Number",
    phoneNumber: "Phone Number",
    courseTitle: "Course Title",
    academicYear: "Academic Year",
    educationLevel: "Education Level",
    city: "City",
    sport: "Sport",
    description: "Description",
    uploadFile: "Upload File",
    submit: "Submit",
    saveAsDraft: "Save as Draft",
    selectEducationLevel: "Select Education Level",
    undergraduate: "Undergraduate",
    postgraduate: "Postgraduate",
    Limassol: "Limassol",
    Nicosia: "Nicosia",
    selectCity: "Select City",
    submitting: "Submitting...",
    isRequired: 'is required',
    maxLength: 'should not be more than {length} characters',
    shouldBeNumeric: 'should be a numeric value',
    betweenNumeric: 'should be a numeric value between {min} and {max}',


  },
  el: {
    firstName: "Όνομα",
    lastName: "Επώνυμο",
    governmentId: "Κυβερνητικό ID",
    registrationNumber: "Αριθμός εγγραφής",
    phoneNumber: "Τηλεφωνικός αριθμός",
    courseTitle: "Τίτλος μαθήματος",
    academicYear: "Ακαδημαϊκό έτος",
    educationLevel: "Επίπεδο εκπαίδευσης",
    city: "Πόλη",
    sport: "Αθλητισμός",
    description: "Περιγραφή",
    uploadFile: "Ανέβασμα αρχείου",
    submit: "Υποβολή",
    saveAsDraft: "Αποθήκευση ως πρόχειρο",
    selectEducationLevel: "Επιλογή επιπέδου εκπαίδευσης",
    undergraduate: "Προπτυχιακό",
    postgraduate: "Μεταπτυχιακό",
    Limassol: "Λεμεσός",
    Nicosia: "Λευκωσία",
    selectCity: "Επιλογή πόλης",
    submitting: "Υποβολή...",
    isRequired: 'είναι απαραίτητο',
    maxLength: 'δεν πρέπει να ξεπερνά τους {length} χαρακτήρες',
    shouldBeNumeric: 'πρέπει να είναι αριθμητική τιμή',
    betweenNumeric: 'πρέπει να είναι αριθμητική τιμή μεταξύ {min} και {max}',


  },
};


