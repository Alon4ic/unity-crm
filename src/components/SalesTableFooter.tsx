
import React from 'react';

interface SalesTableFooterProps {
  salesSum: number;
}

const SalesTableFooter: React.FC<SalesTableFooterProps> = ({ salesSum }) => (
  <tfoot>
    <tr className="bg-muted font-semibold">
      <td colSpan={11} className="text-right pr-4">
        Сумма продаж:
      </td>
      <td className="text-right">{salesSum.toFixed(2)}</td>
    </tr>
  </tfoot>
);

export default SalesTableFooter;