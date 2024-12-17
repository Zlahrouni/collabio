import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class BudgetValidators {
  static minCurrentBudget(currentBudget: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const newBudget = control.value;
      if (newBudget < currentBudget) {
        return {
          minCurrentBudget: {
            required: currentBudget,
            actual: newBudget,
            message: `Le budget doit être supérieur ou égal à ${currentBudget} €`
          }
        };
      }
      return null;
    };
  }
}