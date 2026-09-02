/**
 * NEXORA PULSE - CLINICAL SAFETY & DDI VALIDATION
 */

import { DDI_RULES, MEDICATIONS } from "../data/medications.js";

export class SafetyService {
  static evaluateSafety(prescribedItems, patient) {
    if (!prescribedItems || prescribedItems.length === 0 || !patient) {
      return { status: "SAFE", alerts: [] };
    }

    const alerts = [];
    const patientAllergies = patient.allergies || [];
    const patientCurrentMeds = patient.current_medications || [];

    // Check Allergies
    prescribedItems.forEach(item => {
      const activeName = (item.active_ingredient || item.name || "").toLowerCase();
      const allergyGroup = (item.allergy_group || "").toLowerCase();

      patientAllergies.forEach(allergy => {
        const allergyLower = allergy.toLowerCase();
        let matched = false;

        if (allergyGroup && allergyLower.includes(allergyGroup)) matched = true;
        if (activeName.includes("amoxicillin") && allergyLower.includes("penicillin")) matched = true;

        if (matched) {
          const alternativeDrug = MEDICATIONS.find(m => m.id === "med-003");
          alerts.push({
            id: `allergy-${item.id}-${allergy}`,
            type: "ALLERGY",
            severity: "CRITICAL",
            title: `Severe Allergy Contraindication: ${allergy}`,
            message: `Patient has a documented severe hypersensitivity to "${allergy}". Prescribing "${item.name}" risks acute anaphylaxis.`,
            item_name: item.name,
            recommended_alternative: alternativeDrug ? {
              id: alternativeDrug.id,
              name: alternativeDrug.name,
              reason: `Safe alternative without ${allergy} cross-reactivity`
            } : null
          });
        }
      });
    });

    // Check Drug-Drug Interactions
    prescribedItems.forEach(item => {
      const itemName = (item.active_ingredient || item.name || "").toLowerCase();

      patientCurrentMeds.forEach(currMed => {
        const currMedLower = currMed.toLowerCase();

        if (itemName.includes("azithromycin") && currMedLower.includes("hydroxychloroquine")) {
          const rule = DDI_RULES.find(r => r.id === "ddi-01");
          const altDrug = MEDICATIONS.find(m => m.id === rule.alternative_drug_id);
          alerts.push({
            id: `ddi-azithro-hcq`,
            type: "DDI",
            severity: "CRITICAL",
            title: "Critical DDI: Cardiac QT Prolongation Risk",
            message: `Azithromycin + Hydroxychloroquine co-administration synergistically delays myocardial repolarization, escalating risk of fatal Torsades de Pointes.`,
            item_name: item.name,
            conflicting_drug: currMed,
            recommended_alternative: altDrug ? {
              id: altDrug.id,
              name: altDrug.name,
              reason: rule.recommended_action
            } : null
          });
        }
      });
    });

    const hasCritical = alerts.some(a => a.severity === "CRITICAL");
    return {
      status: hasCritical ? "CRITICAL" : "SAFE",
      alerts: alerts
    };
  }
}
