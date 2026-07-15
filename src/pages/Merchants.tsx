import { MerchantsMenu } from '../components/MerchantsMenu';
import { MerchantsList } from '../components/MerchantsList';
export function Merchants() {
    return (
        <div className="container">
            <MerchantsMenu />
            <div style={{ padding: '30px'}}>
                <h1>Merchants</h1>
                <MerchantsList />
            </div>
        </div>
    )
}