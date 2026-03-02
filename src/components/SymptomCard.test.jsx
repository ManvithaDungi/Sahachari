import { render, screen } from '@testing-library/react';
import SymptomCard from './SymptomCard';

describe('SymptomCard', () => {
   it('renders symptom details correctly', () => {
      const mockCondition = {
         name: 'Flu',
         description: 'Common viral infection',
         probability: 'High'
      };

      render(<SymptomCard condition={mockCondition} />);

      expect(screen.getByText('Flu')).toBeInTheDocument();
      expect(screen.getByText('Common viral infection')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
   });

   it('applies correct styling for High probability', () => {
      const mockCondition = {
         name: 'Severe Flu',
         description: 'Very bad flu',
         probability: 'High'
      };

      render(<SymptomCard condition={mockCondition} />);
      const probabilityBadge = screen.getByText('High');
      expect(probabilityBadge).toHaveClass('text-danger');
   });
});
