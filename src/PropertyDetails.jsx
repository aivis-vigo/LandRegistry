import "./PropertyDetails.scss";

const PropertyDetails = ({web3, details, account, buyProperty, changeListingStatus, togglePopup}) => {
    return details ? (
        <div className="popup-container">
            <div className="details-container">
                <div className="flex justify-end">
                    <button onClick={() => togglePopup()}>
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25"
                             viewBox="0 0 50 50">
                            <path
                                d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 Z"></path>
                        </svg>
                    </button>
                </div>
                <div className="detail">
                    <label>City:</label>
                    <p>{details.city}</p>
                </div>
                <div className="detail">
                    <label>District:</label>
                    <p>{details.district}</p>
                </div>
                <div className="detail">
                    <label>Street:</label>
                    <p>{details.street}</p>
                </div>
                <div className="detail">
                    <label>Price:</label>
                    <p>{web3.utils.fromWei(details.price, 'ether')} ETH</p>
                </div>
                <div className="detail">
                    <label>Square Meters:</label>
                    <p>{details.squareMeters}</p>
                </div>
                <div className="detail">
                    <label>Current Owner:</label>
                    <p>{details.currentOwner}</p>
                </div>
                <div className="detail">
                    <label>Active:</label>
                    <p>{details.activeListing ? 'Yes' : 'No'}</p>
                </div>
                <div className="button-box">
                    {/* users who are not owners can only try to buy this property */}
                    {details.currentOwner !== account && (
                        details.activeListing && (
                            <button onClick={() => buyProperty(details.id)} className="button bg-green-400">
                                Buy
                            </button>
                        )
                    )}
                    {/* only owner can show/hide the listing  */}
                    {details.currentOwner === account && (
                        <button onClick={() => changeListingStatus(details.id)} className="button bg-orange-400">
                            {details.activeListing ? "Deactivate" : "Activate"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div>Missing details</div>
    )
}

export default PropertyDetails;