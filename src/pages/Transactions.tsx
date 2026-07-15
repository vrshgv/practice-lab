import { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { API_BASE } from '../pages/Payments/mocks/handlers';
import { useParams } from 'react-router';
import { Pagination } from '../components/Pagination';

export function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { id } = useParams();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const controller = new AbortController();
        setError('');
        setLoading(true);
        fetch(`${API_BASE}/merchants/${id}/transactions?page=${page}`, { signal: controller.signal})
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('HTTP error')})
        .then(res => {
            console.log(res);
            setTransactions(res.data);
            setTotalPages(res.totalPages);
        })
        .catch(() => { if(controller.signal.aborted) return; setError('Error') })
        .finally(() => setLoading(false));

        return () => controller.abort();
    }, [page, id])

    return (
        <div>
            <div>Transactions</div>
            { loading && <p>Loading...</p>}
            { error && <p>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>id</th>
                        <th>merchantId</th>
                        <th>amount</th>
                        <th>currency</th>
                        <th>status</th>
                        <th>description</th>
                        <th>source</th>
                        <th>chargedAt</th>
                        <th>paidOutAt</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(t => (
                        <tr key={t.id}>
                            <td>{t.id}</td>
                            <td>{t.merchantId}</td>
                            <td>{t.amount}</td>
                            <td>{t.currency}</td>
                            <td>{t.status}</td>
                            <td>{t.description}</td>
                            <td>{t.source}</td>
                            <td>{t.chargedAt}</td>
                            <td>{t.paidOutAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    )
}