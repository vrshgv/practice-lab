import { useState, useEffect } from 'react';
import type { Merchant, Page, Transaction } from '../types';
import { API_BASE } from '../pages/Payments/mocks/handlers';
import { Pagination } from './Pagination';
import { useNavigate } from 'react-router';

export function MerchantsList() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const calculatePayout = (merchant:  Merchant) => {
       const fee = merchant.totalAmount * merchant.discountRate;
       return merchant.totalAmount - fee;
    }

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        fetch(`${API_BASE}/merchants?page=${page}`, { signal: controller.signal})
        .then((res) => {
            if(!res.ok) {
                throw new Error(`HTTP error ${res.status}`)
            }
            return res.json() as Promise<Page<Merchant>>;
        })
        .then(res => {
            setMerchants(res.data);
            setTotalPages(res.totalPages);
            setPage(res.page);
        })
        .catch(e => {
            if (controller.signal.aborted) return;
            console.log(e);
            setError('Something went wrong');
        })
        .finally(() => setLoading(false));
        
        return () => controller.abort();
    }, [page]);


    return (
        <div>
            <h1>Merchants List</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!error && 
            <>
                <table>
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>name</th>
                            <th>discout rate</th>
                            <th>total</th>
                            <th>payout & currency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {merchants.map(m => (
                            <tr key={m.id} onClick={() => navigate(`/merchants/${m.id}/transactions?discount=${m.discountRate}`)}>
                                <td>{m.id}</td>
                                <td>{m.name}</td>
                                <td>{m.discountRate}</td>
                                <td>{m.totalAmount}</td>
                                <td>{calculatePayout(m)} {m.currency}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination totalPages={totalPages} page={page} onPageChange={setPage} />
            </>
            }
        </div>
    )
}
