

const ToolBar = ({account, allAccounts, propertiesCount, changeAccount, togglePopup}) => {
    return (
        <div className="flex flex-row justify-between pb-4 border-b border-black">
            <div className="flex flex-col">
                <p>Account:</p>
                <select value={account} onChange={(e) => changeAccount(e)} className="border rounded-lg p-2">
                    {allAccounts.map((account, index) => (
                        <option key={index} value={account}>
                            {account}
                        </option>
                    ))}
                </select>
            </div>
            <p>Registered Properties: {propertiesCount}</p>
            <button onClick={togglePopup}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M21 14V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H10V5H5V19H19V14H21Z"
                        fill="black"/>
                    <path d="M21 7H17V3H15V7H11V9H15V13H17V9H21V7Z" fill="black"/>
                </svg>
            </button>
        </div>
    )
}

export default ToolBar;