import "./CreatePropertyForm.scss";

const CreatePropertyForm = ({property, createProperty, setProperty, togglePopup}) => {
    const isFormValid = () => {
        return property.city && property.district && property.street && property.squareMeters && property.price;
    };

    return (
        <div className="form-container">
            <div className="inner-container">
                <h2 className="text-lg font-bold mb-4">Add New Property</h2>
                <form onSubmit={(e) => createProperty(e)}>
                    <div className="form-input">
                        <label>City</label>
                        <input
                            value={property.city}
                            onChange={(e) => setProperty({...property, city: e.target.value})}
                        />
                    </div>
                    <div className="form-input">
                        <label>District</label>
                        <input
                            value={property.district}
                            onChange={(e) => setProperty({...property, district: e.target.value})}
                        />
                    </div>
                    <div className="form-input">
                        <label>Street</label>
                        <input
                            value={property.street}
                            onChange={(e) => setProperty({...property, street: e.target.value})}
                        />
                    </div>
                    <div className="form-input">
                        <label>Square Meters</label>
                        <input
                            value={property.squareMeters}
                            onChange={(e) => setProperty({...property, squareMeters: e.target.value})}
                        />
                    </div>
                    <div className="form-input">
                        <label>Price in ETH</label>
                        <input
                            value={property.price}
                            onChange={(e) => setProperty({...property, price: e.target.value})}
                        />
                    </div>
                    <div className="button-box">
                        <button type="submit" className={isFormValid() ? "button bg-green-400" : "button bg-gray-500"} disabled={!isFormValid()} >
                            Submit
                        </button>
                        <button type="button" onClick={togglePopup}
                                className="button bg-red-400">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePropertyForm;