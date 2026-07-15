import { NavLink } from "react-router-dom";
import { useState } from 'react';

export function MerchantsMenu() {
    const [isOpen, setOpen] = useState(false);

    return (
        <>
            <button className="menu-btn" onClick={() => setOpen((e) => !e)}>Menu</button>
            <aside 
                style={{padding: '30px', background: 'black', color: 'white', height: '100vh'}}
                className={ isOpen ? 'open' : 'closed'}
            >
                <h3>Merchants Menu</h3>
                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column'}}>
                    <NavLink to="/merchants">Merchants</NavLink>
                    <NavLink to="/">Transactions</NavLink>
                </div>
            </aside>
        </> 
    )
}