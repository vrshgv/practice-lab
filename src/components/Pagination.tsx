export function Pagination(props: { page:number; totalPages: number; onPageChange: (p: number) => void }) {    
    return (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center'}}>
            <button disabled={props.page === 1} type="button" onClick={() => props.onPageChange(props.page-1)}>Prev</button>
            <span>Page {props.page}</span>
            <button disabled={props.page === props.totalPages} type="button" onClick={() => props.onPageChange(props.page + 1)}>Next</button>
        </div>
    )
}