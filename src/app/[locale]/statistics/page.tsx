'use client';

import { useEffect, useState } from 'react';
import {
    getSalesReport,
    getPeriodComparison,
    SalesReportRow,
} from '@/lib/reports/getSalesReport';
import { getProfitChartData } from '@/lib/reports/getProfitChartData';
import { getStockReport, StockReportRow } from '@/lib/reports/getStockReport';
import { motion, AnimatePresence } from 'framer-motion';
import { SalesReportTable } from '@/components/statisctics/SalesReportTable';
import { ProfitChart } from '@/components/statisctics/ProfitChart';
import { PeriodComparisonCard } from '@/components/statisctics/PeriodComparisonCard';
import { StockReportTable } from '@/components/statisctics/StockReportTable';

export default function StatisticsPage() {
    const [period, setPeriod] = useState<'week' | 'month'>('week');
    const [showTable, setShowTable] = useState(false);
    const [view, setView] = useState<'sales' | 'stock'>('sales');

    const [salesTable, setSalesTable] = useState<SalesReportRow[]>([]);
    const [chartData, setChartData] = useState<
        { date: string; profit: number }[]
    >([]);
    const [comparison, setComparison] = useState<{
        profitCurrent: number;
        profitPrevious: number;
        delta: number;
    } | null>(null);

    const [stockTable, setStockTable] = useState<StockReportRow[]>([]);

    useEffect(() => {
        if (view === 'sales') {
            getSalesReport(period).then(setSalesTable);
            getProfitChartData(period).then(setChartData);
            getPeriodComparison(period).then(setComparison);
        } else {
            getStockReport(period).then(setStockTable);
        }
    }, [period, view]);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">📊 Статистика</h1>

            <div className="flex flex-wrap items-center gap-4">
                <label className="font-medium">Период:</label>
                <select
                    value={period}
                    onChange={(e) =>
                        setPeriod(e.target.value as 'week' | 'month')
                    }
                    className="p-2 border rounded"
                >
                    <option value="week">Последние 7 дней</option>
                    <option value="month">Последние 30 дней</option>
                </select>

                <button
                    onClick={() =>
                        setView(view === 'sales' ? 'stock' : 'sales')
                    }
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded shadow"
                >
                    {view === 'sales'
                        ? '📦 Перейти к остаткам'
                        : '💰 Перейти к продажам'}
                </button>

                {view === 'sales' && (
                    <button
                        onClick={() => setShowTable((prev) => !prev)}
                        className="ml-auto px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                    >
                        {showTable
                            ? '📈 График статистики'
                            : '📊 Таблица статистики'}
                    </button>
                )}
            </div>

            {view === 'sales' && comparison && (
                <PeriodComparisonCard
                    profitCurrent={comparison.profitCurrent}
                    profitPrevious={comparison.profitPrevious}
                    delta={comparison.delta}
                />
            )}

            <AnimatePresence mode="wait">
                {view === 'sales' ? (
                    showTable ? (
                        <motion.div
                            key="sales-table"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <SalesReportTable data={salesTable} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sales-chart"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProfitChart data={chartData} />
                        </motion.div>
                    )
                ) : (
                    <motion.div
                        key="stock-table"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <StockReportTable data={stockTable} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
