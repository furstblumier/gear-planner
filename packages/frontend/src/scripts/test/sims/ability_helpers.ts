import {Ability, ComboData, ComboKeyMatch} from "../../sims/sim_types";
import {STANDARD_APPLICATION_DELAY} from "@xivgear/xivmath/xivconstants";

/**
 * Returns the application delay of an ability (from time of snapshot to time of damage/effects applying).
 *
 * @param ability The ability in question
 */
export function appDelay(ability: Ability) {
    let delay = STANDARD_APPLICATION_DELAY;
    // TODO: add application delay field to Ability
    return delay;
}

function defaultComboData(ability: Ability): ComboData {
    if (ability.type === 'gcd') {
        return {
            comboBehavior: 'break',
            comboKey: "all"
        }
    }
    else {
        return {
            comboBehavior: 'nobreak',
            comboKey: "all"
        }
    }
}

export type FinalizedComboData = {
    combos: ComboData[],
    others: ComboData
}

/**
 * Given an ability with 'raw' combo data, complete the data.
 *
 * First, if there is not a
 *
 * @param ability
 */
export function completeComboData(ability: Ability): FinalizedComboData {
    const all = ability.combos ?? [];
    const combos = [];
    let others: ComboData = null;
    for (let combo of all) {
        const key = combo.comboKey ?? 'default';
        // For continuations, validate that they actually continue off of something that
        // is eligible to start a combo.
        if (combo.comboBehavior === 'continue') {
            combo.comboFrom.forEach((from: Ability) => {
                const found = from.combos?.find(fromCombo => {
                    const otherKey = fromCombo.comboKey ?? 'default';
                    if (otherKey === key) {
                        return fromCombo.comboBehavior === 'start' || fromCombo.comboBehavior === 'continue';
                    }
                    return false;
                });
                if (!found) {
                    console.error(`Ability '${ability.name}' wants to continue combo from '${from.name}' for combo key '${key}', but that skill cannot start this combo.`);
                }
            });
        }
        if (key === "all") {
            others = combo;
        }
        else {
            combos.push({
                ...combo,
                comboKey: key
            });
        }
    }
    if (others === null) {
        others = defaultComboData(ability);
    }
    return {
        combos: combos,
        others: others,
    };
}
