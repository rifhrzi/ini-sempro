const isSempro = (sempro) => {
    return sempro.map((data, i) => {
        return (
            <div key={i} className="card w-full lg:w-96 bg-base-100 w-96 shadow-xl">
                <figure>
                    <img
                        src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                        alt="Shoes" />
                </figure>
                <div className="card-body">
                    <h2 className="card-title">
                        {data.title}
                        <div className="badge badge-secondary">NEW</div>
                    </h2>
                    <p>{data.description}</p>
                    <div className="card-actions justify-end">
                        <div className="badge badge-inline">{data.category}</div>
                        <div className="badge badge-outline">{data.author}</div>
                    </div>
                </div>
            </div>
        )
    })
}

const noSempro = () => {
    return (
        <div>BELUM ADA</div>
    )
}
 
const CardLists = ({ sempro }) => {
        return !sempro ? noSempro() : isSempro(sempro)
}

export default CardLists