
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Home Screen
    'home.todo': 'TO-DO',
    'home.moreForms': 'MORE FORMS',
    'home.today': 'TODAY',
    'home.beforeJobStart': 'BEFORE JOB START',
    'home.afterJobCompleted': 'AFTER JOB COMPLETED',
    'home.completedForms': 'Completed Forms',
    'home.manageJobSite': 'Manage Job-Site',
    'home.safety': 'Safety',
    'home.submittedOn': 'Submitted on:',
    'home.edit': 'EDIT',
    'home.contact': 'Contact:',
    
    // Settings Menu
    'settings.title': 'Settings',
    'settings.selectProject': 'Select Project',
    'settings.profile': 'Profile',
    'settings.language': 'Language',
    'settings.logout': 'Log Out',
    
    // Profile Screen
    'profile.title': 'Profile',
    'profile.name': 'Name',
    'profile.userId': 'User ID',
    'profile.email': 'Email',
    'profile.company': 'Company',
    'profile.role': 'Role',
    'profile.password': 'Password',
    'profile.passwordNote': 'Password changes are managed by your office',
    'profile.backToDashboard': 'Back to Dashboard',
    
    // Forms
    'forms.dailyPreTask': 'DAILY PRE-TASK CHECKLIST',
    'forms.timeCards': 'TIME-CARDS',
    'forms.dailyActivityLog': 'DAILY ACTIVITY LOG',
    'forms.extraWorkTickets': 'EXTRA WORK TICKETS',
    'forms.haulingDumpsters': 'HAULING DUMPSTERS',
    'forms.equipmentInspection': 'EQUIPMENT INSPECTION',
    'forms.observation': 'OBSERVATION',
    'forms.nearMiss': 'NEAR MISS',
    'forms.incident': 'INCIDENT',
    
    // Completed Forms
    'forms.dailyPreTaskCompleted': 'Daily Pre-Task Checklist',
    'forms.timeCardsCompleted': 'Time-Cards',
    'forms.dailyActivityLogCompleted': 'Daily Activity Log',
  },
  es: {
    // Home Screen
    'home.todo': 'POR HACER',
    'home.moreForms': 'MÁS FORMULARIOS',
    'home.today': 'HOY',
    'home.beforeJobStart': 'ANTES DE INICIAR TRABAJO',
    'home.afterJobCompleted': 'DESPUÉS DE COMPLETAR TRABAJO',
    'home.completedForms': 'Formularios Completados',
    'home.manageJobSite': 'Gestionar Sitio de Trabajo',
    'home.safety': 'Seguridad',
    'home.submittedOn': 'Enviado el:',
    'home.edit': 'EDITAR',
    'home.contact': 'Contacto:',
    
    // Settings Menu
    'settings.title': 'Configuración',
    'settings.selectProject': 'Seleccionar Proyecto',
    'settings.profile': 'Perfil',
    'settings.language': 'Idioma',
    'settings.logout': 'Cerrar Sesión',
    
    // Profile Screen
    'profile.title': 'Perfil',
    'profile.name': 'Nombre',
    'profile.userId': 'ID de Usuario',
    'profile.email': 'Correo Electrónico',
    'profile.company': 'Empresa',
    'profile.role': 'Rol',
    'profile.password': 'Contraseña',
    'profile.passwordNote': 'Los cambios de contraseña son gestionados por su oficina',
    'profile.backToDashboard': 'Volver al Panel',
    
    // Forms
    'forms.dailyPreTask': 'LISTA DE VERIFICACIÓN PREVIA DIARIA',
    'forms.timeCards': 'TARJETAS DE TIEMPO',
    'forms.dailyActivityLog': 'REGISTRO DE ACTIVIDAD DIARIA',
    'forms.extraWorkTickets': 'BOLETOS DE TRABAJO EXTRA',
    'forms.haulingDumpsters': 'TRANSPORTE DE CONTENEDORES',
    'forms.equipmentInspection': 'INSPECCIÓN DE EQUIPO',
    'forms.observation': 'OBSERVACIÓN',
    'forms.nearMiss': 'CASI ACCIDENTE',
    'forms.incident': 'INCIDENTE',
    
    // Completed Forms
    'forms.dailyPreTaskCompleted': 'Lista de Verificación Previa Diaria',
    'forms.timeCardsCompleted': 'Tarjetas de Tiempo',
    'forms.dailyActivityLogCompleted': 'Registro de Actividad Diaria',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
