import React from 'react';
import { columnSets, columnTitles, columnSizes } from '@/types/tableColumns';
import { getResponsiveWidthClasses } from '@/utils/columnUtils';

interface TableHeaderProps {
    mode: 'dashboard' | 'sales';
}

const TableHeader: React.FC<TableHeaderProps> = ({ mode }) => {
    const columns = columnSets[mode];

    return (
        <thead className="bg-bg-header">
            <tr>
                {columns.map((key) => {
                    const widthClasses = getResponsiveWidthClasses(
                        key,
                        columnSizes
                    );

                    return (
                        <th
                            key={key}
                            className={`border p-1 laptop:text-base  text-left ${widthClasses}`}
                        >
                            <div className="truncate" title={columnTitles[key]}>
                                {columnTitles[key]}
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};

export default TableHeader;
