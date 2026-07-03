'use client';

import { useState, useCallback } from 'react';

export interface MedicalChecklist {
  hasHypertension: boolean;
  hasGlaucoma: boolean;
  isPregnancy: boolean;
  hasRecentSurgery: boolean;
  hasVertigo: boolean;
}

export function useAntiGravityGating() {
  const [checklist, setChecklist] = useState<MedicalChecklist>({
    hasHypertension: false,
    hasGlaucoma: false,
    isPregnancy: false,
    hasRecentSurgery: false,
    hasVertigo: false,
  });

  const [waiverAccepted, setWaiverAccepted] = useState(false);

  const isEligible = useCallback(() => {
    const hasContraindications = 
      checklist.hasHypertension || 
      checklist.hasGlaucoma || 
      checklist.isPregnancy || 
      checklist.hasRecentSurgery ||
      checklist.hasVertigo;
    
    return !hasContraindications && waiverAccepted;
  }, [checklist, waiverAccepted]);

  const updateQuestion = (key: keyof MedicalChecklist, val: boolean) => {
    setChecklist(prev => ({ ...prev, [key]: val }));
  };

  return {
    checklist,
    waiverAccepted,
    setWaiverAccepted,
    updateQuestion,
    isEligible,
  };
}
